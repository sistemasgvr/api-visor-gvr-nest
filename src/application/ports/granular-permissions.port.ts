import type {
  AuthorizationScope,
  AuthorizationReader,
} from './authorization.port';

export const GRANULAR_PERMISSIONS = Symbol('GRANULAR_PERMISSIONS');

export interface PermissionCatalogEntry {
  idpermiso: number;
  codigo: string;
  modulo: string;
  opcion: string;
  nombre: string;
  alcancespermitidos: AuthorizationScope[];
}
export interface RolePermissionGrant {
  idpermiso: number;
  alcances: AuthorizationScope[];
}
export interface RolePermissionConfiguration {
  idrol: number;
  revision: number;
  permisos: (PermissionCatalogEntry & {
    alcancesconcedidos: AuthorizationScope[];
  })[];
}
export interface MenuPermissionConfiguration {
  idmenu: number;
  revision: number;
  combinacion: 'cualquiera';
  permisos: { idpermiso: number; codigo: string; activo: boolean }[];
}
export interface PermissionChange {
  revision: number;
  modificado: boolean;
  idrol?: number;
  idmenu?: number;
}
/** Resumen de un rol para el listado de administración. */
export interface RolePermissionSummary {
  idrol: number;
  revision: number;
  fechamodificacion: string | null;
  personas: number;
  codigos: string[];
}
export interface RoleMember {
  idusuario: number;
  nombre: string;
  correo: string | null;
  fechaasignacion: string | null;
}
export interface GranularPermissionsPort extends AuthorizationReader {
  roleSummaries(actor: number): Promise<RolePermissionSummary[]>;
  roleMembers(actor: number, roleId: number): Promise<RoleMember[]>;
  catalog(actor: number): Promise<PermissionCatalogEntry[]>;
  role(actor: number, roleId: number): Promise<RolePermissionConfiguration>;
  synchronizeRole(
    actor: number,
    roleId: number,
    grants: RolePermissionGrant[],
    revision: number,
  ): Promise<PermissionChange>;
  menu(actor: number, menuId: number): Promise<MenuPermissionConfiguration>;
  synchronizeMenu(
    actor: number,
    menuId: number,
    permissions: number[],
    revision: number,
  ): Promise<PermissionChange>;
  canNavigate(actor: number, menuId: number): Promise<boolean>;
}
