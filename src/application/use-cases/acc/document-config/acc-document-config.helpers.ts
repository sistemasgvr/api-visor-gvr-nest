import { InvalidInputError } from '../../../errors/application.error';

export function assertSqlTableSuccess(
  result: Record<string, unknown> | null | undefined,
  idKey?: string,
): Record<string, unknown> {
  if (!result) {
    throw new InvalidInputError('Respuesta inválida del servidor');
  }

  const success = result.success ?? result.Success;
  if (success === false) {
    throw new InvalidInputError(
      String(result.message ?? result.Message ?? 'Operación rechazada'),
    );
  }

  if (idKey) {
    const id = result[idKey] ?? result[idKey.toLowerCase()];
    return { ...result, id };
  }

  return result;
}

export function assertSqlJsonSuccess(
  result: Record<string, unknown> | null | undefined,
): Record<string, unknown> {
  if (!result) {
    throw new InvalidInputError('Respuesta inválida del servidor');
  }

  if (result.success === false) {
    throw new InvalidInputError(
      String(result.message ?? 'Operación rechazada'),
    );
  }

  return result;
}
