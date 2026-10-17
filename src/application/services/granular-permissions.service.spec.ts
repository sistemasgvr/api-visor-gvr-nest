import type {
  GranularPermissionsPort,
  RolePermissionGrant,
} from '../ports/granular-permissions.port';
import { ForbiddenError, InvalidInputError } from '../errors/application.error';
import { AuthorizationService } from './authorization.service';
import { GranularPermissionsService } from './granular-permissions.service';

describe('Administración granular sin SQL', () => {
  it('un administrador de menús consulta el catálogo sin consultar concesiones de roles', async () => {
    const reader = { readCurrent: jest.fn().mockResolvedValue({ active: true, grants: [{ code: 'seguridad.menus.ver', scopes: ['global'] }] }) };
    const repository = { ...reader, catalog: jest.fn().mockResolvedValue([]), role: jest.fn() } as unknown as GranularPermissionsPort;
    const policy = { mode: 'global' as const, allowedScopes: ['global' as const], resolve: () => Promise.resolve({ resource: null, activeBoundary: true, businessRulesAllow: true }) };
    const authorization = new AuthorizationService(reader, new Map(['seguridad.roles.ver', 'seguridad.roles.asignar_permisos', 'seguridad.menus.ver'].map(code => [code, policy])));
    const service = new GranularPermissionsService(repository, authorization);
    expect(await service.catalog(7)).toEqual([]);
    await expect(service.role(7, 2)).rejects.toBeInstanceOf(ForbiddenError);
    expect(repository.role).not.toHaveBeenCalled();
  });
  let repository: jest.Mocked<GranularPermissionsPort>;
  let authorization: AuthorizationService;
  let service: GranularPermissionsService;
  beforeEach(() => {
    repository = {
      readCurrent: jest.fn(),
      catalog: jest.fn(),
      role: jest.fn(),
      synchronizeRole: jest.fn(),
      menu: jest.fn(),
      synchronizeMenu: jest.fn(),
      canNavigate: jest.fn(),
      roleSummaries: jest.fn(),
      roleMembers: jest.fn(),
    };
    repository.readCurrent.mockResolvedValue({
      active: true,
      grants: [
        { code: 'seguridad.roles.asignar_permisos', scopes: ['global'] },
        { code: 'seguridad.menus.vincular_permisos', scopes: ['global'] },
      ],
    });
    const policy = {
      mode: 'global' as const,
      allowedScopes: ['global' as const],
      resolve: async () => ({
        resource: null,
        activeBoundary: true,
        businessRulesAllow: true,
      }),
    };
    authorization = new AuthorizationService(
      repository,
      new Map(
        [
          'seguridad.roles.ver',
          'seguridad.roles.asignar_permisos',
          'seguridad.menus.ver',
          'seguridad.menus.vincular_permisos',
        ].map((code) => [code, policy]),
      ),
    );
    service = new GranularPermissionsService(repository, authorization);
  });

  it('revisa el permiso vigente antes de guardar y observa su revocación', async () => {
    await service.synchronizeRole(7, 2, [], 0);
    expect(repository.synchronizeRole).toHaveBeenCalledWith(7, 2, [], 0);
    repository.readCurrent.mockResolvedValue({ active: true, grants: [] });
    await expect(service.synchronizeRole(7, 2, [], 1)).rejects.toBeInstanceOf(
      ForbiddenError,
    );
    expect(repository.synchronizeRole).toHaveBeenCalledTimes(1);
  });

  it('consulta con permiso de lectura pero no permite escribir', async () => {
    repository.readCurrent.mockResolvedValue({
      active: true,
      grants: [{ code: 'seguridad.roles.ver', scopes: ['global'] }],
    });
    await service.role(7, 2);
    expect(repository.role).toHaveBeenCalledWith(7, 2);
    await expect(service.synchronizeRole(7, 2, [], 0)).rejects.toBeInstanceOf(
      ForbiddenError,
    );
    expect(repository.synchronizeRole).not.toHaveBeenCalled();
  });

  it.each([undefined, null, -1, 1.5, '0'])(
    'exige revisión explícita válida: %s',
    async (revision) => {
      await expect(
        service.synchronizeRole(7, 2, [], revision as number),
      ).rejects.toBeInstanceOf(InvalidInputError);
      expect(repository.synchronizeRole).not.toHaveBeenCalled();
    },
  );

  it.each([
    null,
    [{ idpermiso: 1, alcances: [] }],
    [{ idpermiso: 1, alcances: ['asignados', 'asignados'] }],
    [{ idpermiso: 1, alcances: ['admin'] }],
    [
      { idpermiso: 1, alcances: ['global'] },
      { idpermiso: 1, alcances: ['global'] },
    ],
  ])('rechaza una concesión ambigua o inválida: %j', async (grants) => {
    await expect(
      service.synchronizeRole(7, 2, grants as RolePermissionGrant[], 0),
    ).rejects.toBeInstanceOf(InvalidInputError);
    expect(repository.synchronizeRole).not.toHaveBeenCalled();
  });

  it('separa permisos de roles y vínculos de menú y preserva revisión', async () => {
    await service.synchronizeMenu(7, 9, [42], 3);
    expect(repository.synchronizeMenu).toHaveBeenCalledWith(7, 9, [42], 3);
    expect(repository.synchronizeRole).not.toHaveBeenCalled();
    await expect(
      service.synchronizeMenu(7, 9, [42, 42], 3),
    ).rejects.toBeInstanceOf(InvalidInputError);
  });

  it('agrupa por códigos estables aunque los nombres de opciones coincidan', async () => {
    repository.catalog.mockResolvedValue([
      {
        idpermiso: 1,
        codigo: 'seguridad.roles.ver',
        modulo: 'Seguridad',
        opcion: 'Roles',
        nombre: 'Ver',
        alcancespermitidos: ['global'],
      },
      {
        idpermiso: 2,
        codigo: 'seguridad.roles.editar',
        modulo: 'Seguridad',
        opcion: 'Roles',
        nombre: 'Editar',
        alcancespermitidos: ['global'],
      },
      {
        idpermiso: 3,
        codigo: 'usuarios.roles_usuario.asignar',
        modulo: 'Usuarios',
        opcion: 'Roles',
        nombre: 'Asignar',
        alcancespermitidos: ['global'],
      },
    ]);
    const catalog = await service.catalog(7);
    expect(catalog.map((module) => module.codigo)).toEqual([
      'seguridad',
      'usuarios',
    ]);
    expect(catalog[0].opciones[0].permisos).toHaveLength(2);
    expect(catalog[1].opciones[0].codigo).toBe('roles_usuario');
  });
});
