/**
 * Alcance total en validación de actividades: Administrador Sistemas y Administrador GVR.
 * Gerencia y Coordinador BIM no ven todas las actividades en esta pestaña.
 */
import { ROLES_ACCESO_TOTAL_VALIDACION } from '../../../domain/constants/auth-role.constants';

export function esAccesoTotalValidacionActividades(
  rolesIds: number[],
): boolean {
  if (!rolesIds?.length) return false;
  return rolesIds.some((id) =>
    (ROLES_ACCESO_TOTAL_VALIDACION as readonly number[]).includes(id),
  );
}
