/**
 * Rol tal como viene en el JWT / `request.user` (puede traer `nombre` o `name` según origen).
 */
export interface AuthRolePayload {
  id?: number;
  nombre?: string;
  name?: string;
  [key: string]: unknown;
}

/**
 * Usuario inyectado por JwtStrategy (request.user) tras un JWT válido.
 */
export interface AuthenticatedUser {
  id: number;
  sub: number;
  correo: string;
  nombre: string;
  roles: AuthRolePayload[];
  permisos: unknown[];
}
