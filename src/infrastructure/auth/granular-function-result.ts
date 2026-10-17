import {
  ApplicationFailure,
  ConflictError,
  ForbiddenError,
  InvalidInputError,
} from '../../application/errors/application.error';

/** PostgreSQL devuelve JSONB escalar dentro de una columna con el nombre de la función. */
export function granularScalar(row: unknown, functionName: string): unknown {
  if (!row || typeof row !== 'object' || Array.isArray(row))
    throw new Error('Respuesta granular inválida');
  const object = row as Record<string, unknown>;
  const key = Object.keys(object).find(
    (name) => name === functionName || name === functionName.toLowerCase(),
  );
  if (!key) throw new Error('Falta la columna de la función granular');
  const value = object[key];
  return typeof value === 'string' && value !== 'true' && value !== 'false'
    ? JSON.parse(value)
    : value;
}

export function granularDatabaseFailure(error: unknown): never {
  const source = error as {
    code?: string;
    driverError?: { code?: string };
  } | null;
  const code = source?.driverError?.code ?? source?.code;
  if (code === '40001')
    throw new ConflictError({
      message: 'La configuración cambió. Recárgala antes de guardar.',
      code: 'PERMISSIONS_REVISION_CONFLICT',
    });
  if (code === '42501')
    throw new ForbiddenError(
      'No se permite modificar o consultar esta política de permisos',
    );
  if (code === '22023')
    throw new InvalidInputError(
      'El rol, menú, permiso o alcance no es válido o está inactivo',
    );
  // No exponer SQL, estructura de tablas, conexión ni datos del driver al cliente.
  throw new ApplicationFailure('unavailable', {
    message: 'El servicio de permisos no está disponible',
    code: 'PERMISSIONS_UNAVAILABLE',
  });
}
