import { Injectable } from '@nestjs/common';
import type {
  AsistenciaMes,
  EstadoAsistencia,
  TipoMarcaAsistencia,
} from '../../domain/entities/asistencia.entity';
import type { IControlAsistenciaRepository } from '../../domain/repositories/control-asistencia.repository.interface';
import {
  ApplicationFailure,
  ConflictError,
  ForbiddenError,
  InternalError,
  InvalidInputError,
  NotFoundError,
} from '../../application/errors/application.error';
import { DatabaseFunctionService } from '../database/database-function.service';

/**
 * Códigos cuyos mensajes escriben las funciones con_*Asistencia para la persona usuaria.
 * 42501 queda fuera: también lo usa PostgreSQL para privilegios y su texto nombra objetos internos.
 */
const MENSAJES_PROPIOS = new Set(['22023', '55000', 'P0002']);

@Injectable()
export class ControlAsistenciaRepository implements IControlAsistenciaRepository {
  constructor(private readonly database: DatabaseFunctionService) {}

  obtenerEstado(idUsuario: number) {
    return this.call<EstadoAsistencia>('con_EstadoAsistencia', [idUsuario]);
  }

  marcar(idUsuario: number, tipo: TipoMarcaAsistencia, motivo: string | null) {
    return this.call<EstadoAsistencia>('con_MarcarAsistencia', [
      idUsuario,
      tipo,
      motivo,
    ]);
  }

  listarMes(
    idUsuario: number,
    idTrabajador: number | null,
    anio: number,
    mes: number,
  ) {
    return this.call<AsistenciaMes>('con_ListarAsistenciaMes', [
      idUsuario,
      idTrabajador,
      anio,
      mes,
    ]);
  }

  private async call<T>(name: string, params: unknown[]): Promise<T> {
    try {
      // RETURNS jsonb: una fila con el nombre de la función como columna.
      const row = await this.database.callFunctionSingle<Record<string, T>>(
        name,
        params,
      );
      const data = row?.[name];
      if (data == null || typeof data !== 'object' || Array.isArray(data)) {
        throw new InternalError({
          code: 'ASISTENCIA_RESPUESTA_INVALIDA',
          message: 'No se pudo obtener la respuesta de asistencia',
        });
      }
      return data;
    } catch (error: unknown) {
      if (error instanceof ApplicationFailure) throw error;
      throw traducirError(error);
    }
  }
}

/** Traduce el error del driver sin exponer consultas ni parámetros. */
export function traducirError(error: unknown): ApplicationFailure {
  const source =
    error && typeof error === 'object'
      ? (error as {
          code?: string;
          message?: string;
          driverError?: { code?: string; message?: string };
        })
      : {};
  const code = source.driverError?.code ?? source.code;
  const propio =
    code && MENSAJES_PROPIOS.has(code)
      ? (source.driverError?.message ?? source.message)
      : undefined;

  if (code === '42501')
    return new ForbiddenError({
      code: 'ASISTENCIA_NO_HABILITADA',
      message: 'Tu perfil no tiene habilitado el registro de asistencia',
    });
  if (code === 'P0002')
    return new NotFoundError({
      code: 'ASISTENCIA_COLABORADOR_NO_ENCONTRADO',
      message: propio ?? 'No se encontró el colaborador',
    });
  if (code === '55000')
    return new ConflictError({
      code: 'ASISTENCIA_MARCA_NO_PERMITIDA',
      message: propio ?? 'La marca no corresponde en este momento',
    });
  if (code === '23505' || code === '40001' || code === '40P01')
    return new ConflictError({
      code: 'ASISTENCIA_CONCURRENCIA',
      message: 'Se registró otra marca al mismo tiempo; vuelva a cargar e intente de nuevo',
    });
  if (code === '22023')
    return new InvalidInputError({
      code: 'ASISTENCIA_DATOS_INVALIDOS',
      message: propio ?? 'Revise los datos de la marca',
    });
  if (code && ['22007', '22008', '22P02', '22003', '23502', '23503', '23514'].includes(code))
    return new InvalidInputError({
      code: 'ASISTENCIA_DATOS_INVALIDOS',
      message: 'Revise los datos de la marca',
    });
  return new InternalError({
    code: 'ASISTENCIA_ERROR_INTERNO',
    message: 'No se pudo completar la operación de asistencia',
  });
}
