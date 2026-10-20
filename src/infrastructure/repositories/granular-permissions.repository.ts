import { Injectable } from '@nestjs/common';
import type {
  AuthorizationScope,
  AuthorizationSnapshot,
} from '../../application/ports/authorization.port';
import type {
  ClonedRole,
  GranularPermissionsPort,
  MenuPermissionConfiguration,
  PermissionCatalogEntry,
  PermissionChange,
  RolePermissionConfiguration,
  RolePermissionGrant,
  RolePermissionSummary,
  RoleMember,
} from '../../application/ports/granular-permissions.port';
import { DatabaseFunctionService } from '../database/database-function.service';
import {
  granularDatabaseFailure,
  granularScalar,
} from '../auth/granular-function-result';

const scopes = new Set(['global', 'propios', 'asignados', 'todos']);
const isObject = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);
const isId = (value: unknown): value is number =>
  Number.isSafeInteger(value) && (value as number) > 0;
const isCode = (value: unknown): value is string =>
  typeof value === 'string' &&
  /^[a-z][a-z0-9_]*\.[a-z][a-z0-9_]*\.[a-z][a-z0-9_]*$/.test(value);
const isScopes = (value: unknown): value is AuthorizationScope[] =>
  Array.isArray(value) &&
  value.every((item) => typeof item === 'string' && scopes.has(item));
const isCatalog = (value: unknown): value is PermissionCatalogEntry =>
  isObject(value) &&
  isId(value.idpermiso) &&
  isCode(value.codigo) &&
  ['modulo', 'opcion', 'nombre'].every(
    (key) => typeof value[key] === 'string',
  ) &&
  isScopes(value.alcancespermitidos);

@Injectable()
export class GranularPermissionsRepository implements GranularPermissionsPort {
  constructor(private readonly database: DatabaseFunctionService) {}

  private async scalar<T>(
    name: string,
    params: unknown[],
    valid: (value: unknown) => boolean,
  ): Promise<T> {
    try {
      const value = granularScalar(
        await this.database.callFunctionSingle<unknown>(name, params),
        name,
      );
      if (!valid(value)) throw new Error('Contrato granular inválido');
      return value as T;
    } catch (error) {
      return granularDatabaseFailure(error);
    }
  }

  async readCurrent(userId: number): Promise<AuthorizationSnapshot> {
    try {
      const rows = await this.database.callFunction<Record<string, unknown>>(
        'auth_ObtenerPermisosEfectivos',
        [userId],
      );
      if (
        !Array.isArray(rows) ||
        !rows.every(
          (row) =>
            isObject(row) &&
            isCode(row.codigo) &&
            isScopes(row.alcances) &&
            row.alcances.length > 0,
        )
      )
        throw new Error('Permisos efectivos inválidos');
      // La función ya filtra usuario, roles y definiciones inactivos. Sin filas no hay ninguna facultad.
      return {
        active: rows.length > 0,
        grants: rows.map((row) => ({
          code: row.codigo as string,
          scopes: row.alcances as AuthorizationScope[],
        })),
      };
    } catch (error) {
      return granularDatabaseFailure(error);
    }
  }

  async catalog(actor: number): Promise<PermissionCatalogEntry[]> {
    try {
      const rows = await this.database.callFunction<PermissionCatalogEntry>(
        'auth_ListarCatalogoPermisos',
        [actor],
      );
      if (!Array.isArray(rows) || !rows.every(isCatalog))
        throw new Error('Catálogo inválido');
      return rows;
    } catch (error) {
      return granularDatabaseFailure(error);
    }
  }

  role(actor: number, roleId: number): Promise<RolePermissionConfiguration> {
    return this.scalar(
      'auth_ListarPermisosRolV2',
      [actor, roleId],
      (value) =>
        isObject(value) &&
        value.idrol === roleId &&
        Number.isSafeInteger(value.revision) &&
        (value.revision as number) >= 0 &&
        Array.isArray(value.permisos) &&
        value.permisos.every(
          (entry) =>
            isCatalog(entry) &&
            isObject(entry) &&
            isScopes(entry.alcancesconcedidos) &&
            entry.alcancesconcedidos.every((scope) =>
              entry.alcancespermitidos.includes(scope),
            ),
        ),
    );
  }

  roleSummaries(actor: number): Promise<RolePermissionSummary[]> {
    return this.scalar(
      'auth_ResumenPermisosRoles',
      [actor],
      (value) =>
        Array.isArray(value) &&
        value.every(
          (entry) =>
            isObject(entry) &&
            isId(entry.idrol) &&
            Number.isSafeInteger(entry.revision) &&
            Number.isSafeInteger(entry.personas) &&
            (entry.fechamodificacion === null ||
              typeof entry.fechamodificacion === 'string') &&
            Array.isArray(entry.codigos) &&
            entry.codigos.every(isCode),
        ),
    );
  }

  roleMembers(actor: number, roleId: number): Promise<RoleMember[]> {
    return this.scalar(
      'auth_ListarPersonasRol',
      [actor, roleId],
      (value) =>
        Array.isArray(value) &&
        value.every(
          (entry) =>
            isObject(entry) &&
            isId(entry.idusuario) &&
            typeof entry.nombre === 'string',
        ),
    );
  }

  synchronizeRole(
    actor: number,
    roleId: number,
    grants: RolePermissionGrant[],
    revision: number,
  ): Promise<PermissionChange> {
    return this.scalar(
      'auth_SincronizarPermisosRolV2',
      [actor, roleId, JSON.stringify(grants), revision],
      (value) => this.isChange(value, 'idrol', roleId),
    );
  }

  cloneRole(
    actor: number,
    roleId: number,
    name: string,
    description: string | null,
  ): Promise<ClonedRole> {
    return this.scalar(
      'auth_ClonarRolV2',
      [actor, roleId, name, description],
      (value) =>
        isObject(value) &&
        isId(value.idrol) &&
        value.origen === roleId &&
        typeof value.nombre === 'string' &&
        Number.isSafeInteger(value.totalacciones),
    );
  }

  menu(actor: number, menuId: number): Promise<MenuPermissionConfiguration> {
    return this.scalar(
      'gen_ObtenerPermisosMenuGranulares',
      [actor, menuId],
      (value) =>
        isObject(value) &&
        value.idmenu === menuId &&
        Number.isSafeInteger(value.revision) &&
        (value.revision as number) >= 0 &&
        value.combinacion === 'cualquiera' &&
        Array.isArray(value.permisos) &&
        value.permisos.every(
          (entry) =>
            isObject(entry) &&
            isId(entry.idpermiso) &&
            isCode(entry.codigo) &&
            typeof entry.activo === 'boolean',
        ),
    );
  }

  synchronizeMenu(
    actor: number,
    menuId: number,
    permissions: number[],
    revision: number,
  ): Promise<PermissionChange> {
    return this.scalar(
      'gen_SincronizarPermisosMenuGranulares',
      [actor, menuId, permissions, revision],
      (value) => this.isChange(value, 'idmenu', menuId),
    );
  }

  canNavigate(actor: number, menuId: number): Promise<boolean> {
    return this.scalar(
      'gen_UsuarioTieneAccesoMenuV2',
      [actor, menuId],
      (value) => typeof value === 'boolean',
    );
  }

  private isChange(value: unknown, key: string, id: number): boolean {
    return (
      isObject(value) &&
      value[key] === id &&
      Number.isSafeInteger(value.revision) &&
      (value.revision as number) >= 0 &&
      typeof value.modificado === 'boolean'
    );
  }
}
