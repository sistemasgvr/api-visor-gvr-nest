import type { AuthRolePayload } from '../types/authenticated-user';

export const ROL_ADMINISTRADOR_SISTEMAS = 1;

export function extraerIdsRoles(roles?: AuthRolePayload[]): number[] {
  if (!roles?.length) return [];
  return roles
    .map((rol) => Number(rol.id))
    .filter((id) => Number.isFinite(id) && id > 0);
}

/** Solo Administrador Sistemas (rol 1) ve todos los entregables. */
export function esAdminSistemas(rolesIds: number[]): boolean {
  return rolesIds.includes(ROL_ADMINISTRADOR_SISTEMAS);
}
