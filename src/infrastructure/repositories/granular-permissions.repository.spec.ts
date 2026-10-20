import {
  ApplicationFailure,
  ConflictError,
  ForbiddenError,
} from '../../application/errors/application.error';
import { DatabaseFunctionService } from '../database/database-function.service';
import { GranularPermissionsRepository } from './granular-permissions.repository';
import { MenuRepository } from './menu.repository';

describe('Adaptadores granulares con driver simulado; sin conexión ni SQL', () => {
  const database = { callFunction: jest.fn(), callFunctionSingle: jest.fn() };
  let repository: GranularPermissionsRepository;
  beforeEach(() => {
    jest.resetAllMocks();
    repository = new GranularPermissionsRepository(
      database as unknown as DatabaseFunctionService,
    );
  });

  it('lee las concesiones de la función vigente en cada solicitud', async () => {
    database.callFunction
      .mockResolvedValueOnce([
        { codigo: 'seguridad.roles.ver', alcances: ['global'] },
      ])
      .mockResolvedValueOnce([]);
    expect((await repository.readCurrent(7)).grants).toEqual([
      { code: 'seguridad.roles.ver', scopes: ['global'] },
    ]);
    expect((await repository.readCurrent(7)).grants).toEqual([]);
    expect(database.callFunction).toHaveBeenNthCalledWith(
      2,
      'auth_ObtenerPermisosEfectivos',
      [7],
    );
  });

  it('envía actor, rol, JSON normalizado y revisión en el orden de la nueva función', async () => {
    database.callFunctionSingle.mockResolvedValue({
      auth_SincronizarPermisosRolV2: {
        idrol: 2,
        revision: 4,
        modificado: true,
      },
    });
    const grants = [{ idpermiso: 42, alcances: ['asignados' as const] }];
    expect(await repository.synchronizeRole(7, 2, grants, 3)).toEqual({
      idrol: 2,
      revision: 4,
      modificado: true,
    });
    expect(database.callFunctionSingle).toHaveBeenCalledWith(
      'auth_SincronizarPermisosRolV2',
      [7, 2, JSON.stringify(grants), 3],
    );
  });

  it.each([
    ['40001', ConflictError],
    ['42501', ForbiddenError],
    ['42P01', ApplicationFailure],
    ['network', ApplicationFailure],
  ])('traduce %s sin exponer detalles del proveedor', async (code, kind) => {
    database.callFunctionSingle.mockRejectedValue({
      driverError: { code },
      message: 'SQL y credenciales privados',
    });
    const promise = repository.synchronizeMenu(7, 9, [], 0);
    await expect(promise).rejects.toBeInstanceOf(kind);
    await expect(promise).rejects.not.toHaveProperty(
      'message',
      'SQL y credenciales privados',
    );
  });

  it.each([
    { columnaInventada: true },
    { gen_UsuarioTieneAccesoMenuV2: 'true' },
    { gen_UsuarioTieneAccesoMenuV2: 1 },
  ])('no concede navegación con una respuesta ambigua: %j', async (result) => {
    database.callFunctionSingle.mockResolvedValue(result);
    await expect(repository.canNavigate(7, 9)).rejects.toBeInstanceOf(
      ApplicationFailure,
    );
  });

  it('distingue booleano false de una respuesta malformada', async () => {
    database.callFunctionSingle.mockResolvedValue({
      gen_usuariotieneaccesomenuv2: false,
    });
    expect(await repository.canNavigate(7, 9)).toBe(false);
  });

  it('rechaza una respuesta de otro rol', async () => {
    database.callFunctionSingle.mockResolvedValue({
      auth_ListarPermisosRolV2: { idrol: 99, revision: 0, permisos: [] },
    });
    await expect(repository.role(7, 2)).rejects.toBeInstanceOf(
      ApplicationFailure,
    );
  });

  it('preserva submenús arbitrarios y contenedores sin URL usando sólo V3', async () => {
    const leaf = {
      id: 3,
      nombre: 'Hoja',
      url: '/proyectos',
      accesodirecto: true,
      hijos: [],
    };
    const tree = [
      {
        id: 1,
        nombre: 'Raíz',
        url: null,
        accesodirecto: false,
        hijos: [
          {
            id: 2,
            nombre: 'Grupo',
            url: null,
            accesodirecto: false,
            hijos: [leaf],
          },
        ],
      },
    ];
    database.callFunctionSingle.mockResolvedValue({
      gen_ListarMenuRecursivoPorUsuarioV3: tree,
    });
    const menu = new MenuRepository(
      database as unknown as DatabaseFunctionService,
    );
    expect(await menu.listarMenuRecursivo(7)).toEqual(tree);
    expect(database.callFunctionSingle).toHaveBeenCalledWith(
      'gen_ListarMenuRecursivoPorUsuarioV3',
      [7],
    );
  });

  it('no recupera el menú antiguo cuando V3 está ausente', async () => {
    database.callFunctionSingle.mockRejectedValue({ code: '42883' });
    await expect(
      new MenuRepository(
        database as unknown as DatabaseFunctionService,
      ).listarMenuRecursivo(7),
    ).rejects.toBeInstanceOf(ApplicationFailure);
    expect(database.callFunctionSingle).toHaveBeenCalledTimes(1);
  });

  it('rechaza una URL navegable en un contenedor no autorizado', async () => {
    database.callFunctionSingle.mockResolvedValue({
      gen_ListarMenuRecursivoPorUsuarioV3: [
        {
          id: 1,
          nombre: 'Grupo',
          url: '/admin',
          accesodirecto: false,
          hijos: [],
        },
      ],
    });
    await expect(
      new MenuRepository(
        database as unknown as DatabaseFunctionService,
      ).listarMenuRecursivo(7),
    ).rejects.toBeInstanceOf(ApplicationFailure);
  });
});
