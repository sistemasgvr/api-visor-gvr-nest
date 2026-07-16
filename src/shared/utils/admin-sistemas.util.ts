import type { AuthRolePayload } from '../types/authenticated-user';
import {
  AuthRole,
  ROL_ADMINISTRADOR_SISTEMAS,
} from '../../domain/constants/auth-role.constants';

export { ROL_ADMINISTRADOR_SISTEMAS, AuthRole };

export function extraerIdsRoles(roles?: AuthRolePayload[]): number[] {
  if (!roles?.length) return [];
  return roles
    .map((rol) => Number(rol.id))
    .filter((id) => Number.isFinite(id) && id > 0);
}

/** Solo Administrador Sistemas ve todos los entregables (salvo otras reglas). */
export function esAdminSistemas(rolesIds: number[]): boolean {
  return rolesIds.includes(ROL_ADMINISTRADOR_SISTEMAS);
}
