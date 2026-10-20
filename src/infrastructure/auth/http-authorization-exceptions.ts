/** Excepciones puntuales del ciclo de sesión; ninguna habilita operaciones de negocio. */
const SESSION_ENDPOINTS = new Map<string, string>([
  ['HealthController.check', 'Salud del proceso.'],
  ['AuthController.login', 'Autenticación con limitación de intentos.'],
  ['AuthController.refreshToken', 'Renovación contra la sesión activa.'],
  ['AuthController.logout', 'Cierre de la sesión autenticada.'],
  ['AuthController.validarSesion', 'Validación de la propia sesión.'],
  ['AuthController.obtenerPerfil', 'Lectura del perfil de la propia sesión.'],
  [
    'AuthorizationController.current',
    'Lectura de las propias concesiones; no concede acceso a recursos.',
  ],
  [
    'AuthorizationController.navigation',
    'Evaluación del menú para la propia identidad.',
  ],
  [
    'GeneralController.listarMenuRecursivo',
    'Árbol del menú resuelto para la propia identidad.',
  ],
]);

export const isSessionEndpoint = (
  controller: string,
  handler: string,
): boolean => SESSION_ENDPOINTS.has(`${controller}.${handler}`);
