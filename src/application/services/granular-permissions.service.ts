import { ForbiddenError, InvalidInputError } from '../errors/application.error';
import type {
  GranularPermissionsPort,
  RolePermissionGrant,
} from '../ports/granular-permissions.port';
import { AuthorizationService } from './authorization.service';

/** Actor siempre procede de la sesión validada, nunca del body o de la URL. */
export class GranularPermissionsService {
  constructor(
    private readonly repository: GranularPermissionsPort,
    private readonly authorization: AuthorizationService,
  ) {}

  private id(value: number) {
    if (!Number.isSafeInteger(value) || value < 1 || value > 2147483647)
      throw new InvalidInputError('Identificador inválido');
  }

  private revision(value: number) {
    if (!Number.isSafeInteger(value) || value < 0 || value > 2147483647)
      throw new InvalidInputError(
        'La revisión es obligatoria y debe ser un entero no negativo',
      );
  }

  private async require(actor: number, codes: string[]) {
    this.id(actor);
    for (const code of codes)
      if (await this.authorization.can(actor, code)) return;
    throw new ForbiddenError(
      'No tienes permiso para administrar esta configuración',
    );
  }

  async current(actor: number) {
    this.id(actor);
    return this.repository.readCurrent(actor);
  }

  /** Resumen por rol (acciones, personas y última modificación) para el listado. */
  async roleSummaries(actor: number) {
    await this.require(actor, [
      'seguridad.roles.ver',
      'seguridad.roles.asignar_permisos',
    ]);
    return this.repository.roleSummaries(actor);
  }

  /** Personas activas con el rol. */
  async roleMembers(actor: number, roleId: number) {
    this.id(roleId);
    await this.require(actor, [
      'seguridad.roles.ver',
      'seguridad.roles.asignar_permisos',
    ]);
    return this.repository.roleMembers(actor, roleId);
  }

  async catalog(actor: number) {
    await this.require(actor, [
      'seguridad.roles.ver',
      'seguridad.roles.asignar_permisos',
      'seguridad.menus.ver',
      'seguridad.menus.vincular_permisos',
    ]);
    const entries = await this.repository.catalog(actor);
    const modules = new Map<
      string,
      {
        codigo: string;
        nombre: string;
        opciones: {
          codigo: string;
          nombre: string;
          permisos: typeof entries;
        }[];
      }
    >();
    for (const entry of entries) {
      const [moduleCode, optionCode] = entry.codigo.split('.');
      if (!modules.has(moduleCode))
        modules.set(moduleCode, {
          codigo: moduleCode,
          nombre: entry.modulo,
          opciones: [],
        });
      const module = modules.get(moduleCode)!;
      let option = module.opciones.find((item) => item.codigo === optionCode);
      if (!option) {
        option = { codigo: optionCode, nombre: entry.opcion, permisos: [] };
        module.opciones.push(option);
      }
      option.permisos.push(entry);
    }
    return [...modules.values()];
  }

  async role(actor: number, roleId: number) {
    this.id(roleId);
    await this.require(actor, [
      'seguridad.roles.ver',
      'seguridad.roles.asignar_permisos',
    ]);
    return this.repository.role(actor, roleId);
  }

  async synchronizeRole(
    actor: number,
    roleId: number,
    grants: RolePermissionGrant[],
    revision: number,
  ) {
    this.id(roleId);
    this.revision(revision);
    if (!Array.isArray(grants) || grants.length > 10000)
      throw new InvalidInputError('La lista de permisos es obligatoria');
    const ids = new Set<number>();
    for (const grant of grants) {
      if (!grant || typeof grant !== 'object')
        throw new InvalidInputError('Permiso inválido');
      this.id(grant.idpermiso);
      if (
        ids.has(grant.idpermiso) ||
        !Array.isArray(grant.alcances) ||
        !grant.alcances.length ||
        new Set(grant.alcances).size !== grant.alcances.length ||
        grant.alcances.some(
          (scope) =>
            !['global', 'propios', 'asignados', 'todos'].includes(scope),
        )
      )
        throw new InvalidInputError('Permisos duplicados o alcances inválidos');
      ids.add(grant.idpermiso);
    }
    await this.require(actor, ['seguridad.roles.asignar_permisos']);
    // Una sola función transaccional valida catálogo, revisión, auditoría y último administrador.
    return this.repository.synchronizeRole(actor, roleId, grants, revision);
  }

  async menu(actor: number, menuId: number) {
    this.id(menuId);
    await this.require(actor, [
      'seguridad.menus.ver',
      'seguridad.menus.vincular_permisos',
    ]);
    return this.repository.menu(actor, menuId);
  }

  async synchronizeMenu(
    actor: number,
    menuId: number,
    permissions: number[],
    revision: number,
  ) {
    this.id(menuId);
    this.revision(revision);
    if (
      !Array.isArray(permissions) ||
      permissions.length > 10000 ||
      new Set(permissions).size !== permissions.length
    )
      throw new InvalidInputError('Lista de permisos inválida o duplicada');
    permissions.forEach((id) => this.id(id));
    await this.require(actor, ['seguridad.menus.vincular_permisos']);
    return this.repository.synchronizeMenu(
      actor,
      menuId,
      permissions,
      revision,
    );
  }

  async canNavigate(actor: number, menuId: number) {
    this.id(actor);
    this.id(menuId);
    return { permitido: await this.repository.canNavigate(actor, menuId) };
  }
}
