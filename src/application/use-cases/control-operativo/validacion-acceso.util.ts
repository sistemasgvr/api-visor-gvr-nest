/**
 * Alcance total en validación de actividades: solo Administrador Sistemas (1) y Administrador GVR (11).
 * Gerencia y Coordinador BIM no ven todas las actividades en esta pestaña.
 */
const ROL_ADMINISTRADOR_SISTEMAS = 1;
const ROL_ADMINISTRADOR_GVR = 11;

export function esAccesoTotalValidacionActividades(
  rolesIds: number[],
): boolean {
  if (!rolesIds?.length) return false;
  return rolesIds.some(
    (id) => id === ROL_ADMINISTRADOR_SISTEMAS || id === ROL_ADMINISTRADOR_GVR,
  );
}
