/**
 * IDs de roles (authroles.id).
 * Alinear con front `authRole.enum.ts` / `roles.constants.ts`.
 */
export const AuthRole = {
  Administrador: 1, // ADMINISTRADOR SISTEMAS
  Modelador: 3, // MODELADOR BIM
  Coordinador: 4, // COORDINADOR BIM
  Gerencia: 5, // GERENCIA
  AsistenteMarketing: 7, // ASISTENTE DE MARKETING
  DesarrolladorWeb: 9, // DESARROLLADOR WEB
  EncargadoMarketing: 10, // ENCARGADO DE MARKETING
  AdministradorGvr: 11, // ADMINISTRADOR GVR
} as const;

export type AuthRoleId = (typeof AuthRole)[keyof typeof AuthRole];

/**
 * Roles admin de Control Operativo (filtros / fallbacks de rolesAdmin).
 * Front: ROLES_ADMIN_CONTROL_OPERATIVO.
 */
export const ROLES_ADMIN_CONTROL_OPERATIVO: readonly AuthRoleId[] = [
  AuthRole.Administrador,
  AuthRole.Gerencia,
  AuthRole.AdministradorGvr,
] as const;

/**
 * Roles con visión total en validación de actividades.
 * Front: ROLES_ACCESO_TOTAL_VALIDACION.
 */
export const ROLES_ACCESO_TOTAL_VALIDACION: readonly AuthRoleId[] = [
  AuthRole.Administrador,
  AuthRole.AdministradorGvr,
] as const;

/** Alias usados históricamente en utils Nest. */
export const ROL_ADMINISTRADOR_SISTEMAS = AuthRole.Administrador;
export const ROL_ADMINISTRADOR_GVR = AuthRole.AdministradorGvr;
