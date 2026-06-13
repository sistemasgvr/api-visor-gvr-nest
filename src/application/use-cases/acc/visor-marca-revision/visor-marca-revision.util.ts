import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import type { OperacionVisorMarcaRevisionResult } from '../../../../domain/repositories/acc-visor-marca-revision.repository.interface';

export function assertOperacionMarcaRevision(
  result: OperacionVisorMarcaRevisionResult,
  accion: string,
): void {
  if (result.success) return;

  const msg = result.message ?? `No se pudo ${accion}`;
  const lower = msg.toLowerCase();

  if (lower.includes('no encontrada') || lower.includes('suprimida')) {
    throw new NotFoundException(msg);
  }
  if (
    lower.includes('solo el creador') ||
    lower.includes('permiso') ||
    lower.includes('no tiene permiso')
  ) {
    throw new ForbiddenException(msg);
  }
  throw new BadRequestException(msg);
}

export function parseQueryBoolean(value: string | undefined): boolean | undefined {
  if (value == null || value.trim() === '') return undefined;
  const v = value.trim().toLowerCase();
  if (v === 'true' || v === '1') return true;
  if (v === 'false' || v === '0') return false;
  return undefined;
}
