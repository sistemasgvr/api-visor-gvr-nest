import { BadRequestException } from '@nestjs/common';

export function assertSqlTableSuccess(
  result: Record<string, unknown> | null | undefined,
  idKey?: string,
): Record<string, unknown> {
  if (!result) {
    throw new BadRequestException('Respuesta inválida del servidor');
  }

  const success = result.success ?? result.Success;
  if (success === false) {
    throw new BadRequestException(
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
    throw new BadRequestException('Respuesta inválida del servidor');
  }

  if (result.success === false) {
    throw new BadRequestException(
      String(result.message ?? 'Operación rechazada'),
    );
  }

  return result;
}
