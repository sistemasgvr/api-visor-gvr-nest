import { Injectable } from '@nestjs/common';
import type {
  ActualizarCalendarioData,
  CrearCalendarioData,
  GuardarExcepcionCalendarioData,
  GuardarSemanaCalendarioData,
  ICalendariosRepository,
  ListarCalendariosParams,
} from '../../domain/repositories/calendarios.repository.interface';
import type {
  CalendarioDetalle,
  CalendarioDisponibilidad,
  CalendarioListado,
  EstadoCalendario,
} from '../../domain/entities/calendario.entity';
import {
  ApplicationFailure,
  ConflictError,
  ForbiddenError,
  InternalError,
  InvalidInputError,
  NotFoundError,
} from '../../application/errors/application.error';
import { DatabaseFunctionService } from '../database/database-function.service';

@Injectable()
export class CalendariosRepository implements ICalendariosRepository {
  constructor(private readonly database: DatabaseFunctionService) {}

  listar(idUsuario: number, params: ListarCalendariosParams) {
    return this.call<CalendarioListado>('pla_ListarCalendarios', [
      idUsuario,
      params.busqueda ?? '',
      params.estado ?? null,
      params.limit ?? 20,
      params.offset ?? 0,
    ]);
  }
  obtener(idUsuario: number, id: number, idVersion?: number) {
    return this.call<CalendarioDetalle>('pla_ObtenerCalendario', [
      idUsuario,
      id,
      idVersion ?? null,
    ]);
  }
  crear(idUsuario: number, data: CrearCalendarioData) {
    return this.call<CalendarioDetalle>('pla_CrearCalendario', [
      idUsuario,
      data.nombre.trim(),
      data.descripcion ?? '',
      data.zonahoraria ?? 'America/Lima',
    ]);
  }
  actualizar(idUsuario: number, id: number, data: ActualizarCalendarioData) {
    return this.call<CalendarioDetalle>('pla_ActualizarCalendario', [
      idUsuario,
      id,
      data.revision,
      data.nombre.trim(),
      data.descripcion ?? '',
    ]);
  }
  duplicar(idUsuario: number, idVersionOrigen: number, nombre: string) {
    return this.call<CalendarioDetalle>('pla_DuplicarCalendario', [
      idUsuario,
      idVersionOrigen,
      nombre.trim(),
    ]);
  }
  crearVersion(idUsuario: number, idVersionOrigen: number) {
    return this.call<CalendarioDetalle>('pla_CrearVersionCalendario', [
      idUsuario,
      idVersionOrigen,
    ]);
  }
  guardarSemana(
    idUsuario: number,
    idVersion: number,
    data: GuardarSemanaCalendarioData,
  ) {
    return this.call<CalendarioDetalle>('pla_GuardarJornadaSemanal', [
      idUsuario,
      idVersion,
      data.revision,
      data.zonahoraria,
      JSON.stringify(data.semana),
    ]);
  }
  guardarExcepcion(
    idUsuario: number,
    idVersion: number,
    data: GuardarExcepcionCalendarioData,
    idExcepcion?: number,
  ) {
    return this.call<CalendarioDetalle>('pla_GuardarExcepcionCalendario', [
      idUsuario,
      idVersion,
      data.revision,
      data.fecha,
      data.nombre.trim(),
      data.idtipo,
      data.minutosefectivos,
      data.activo ?? true,
      idExcepcion ?? null,
    ]);
  }
  eliminarExcepcion(
    idUsuario: number,
    idVersion: number,
    revision: number,
    idExcepcion: number,
  ) {
    return this.call<CalendarioDetalle>('pla_EliminarExcepcionCalendario', [
      idUsuario,
      idVersion,
      revision,
      idExcepcion,
    ]);
  }
  publicarVersion(idUsuario: number, idVersion: number, revision: number) {
    return this.call<CalendarioDetalle>('pla_PublicarVersionCalendario', [
      idUsuario,
      idVersion,
      revision,
    ]);
  }
  cambiarEstado(
    idUsuario: number,
    id: number,
    revision: number,
    estado: EstadoCalendario,
  ) {
    return this.call<CalendarioDetalle>('pla_CambiarEstadoCalendario', [
      idUsuario,
      id,
      revision,
      estado,
    ]);
  }
  disponibilidad(
    idUsuario: number,
    idVersion: number,
    desde: string,
    hasta: string,
  ) {
    return this.call<CalendarioDisponibilidad>(
      'pla_ObtenerDisponibilidadCalendario',
      [idUsuario, idVersion, desde, hasta],
    );
  }

  private async call<T>(name: string, params: unknown[]): Promise<T> {
    try {
      // RETURNS jsonb: el servicio existente devuelve una fila con el nombre de la función como columna.
      const row = await this.database.callFunctionSingle<Record<string, T>>(
        name,
        params,
      );
      const data = row?.[name];
      if (data == null || typeof data !== 'object' || Array.isArray(data)) {
        throw new InternalError({
          code: 'CALENDARIOS_RESPUESTA_INVALIDA',
          message: 'No se pudo obtener la respuesta del calendario',
        });
      }
      return data;
    } catch (error: unknown) {
      if (error instanceof ApplicationFailure) throw error;
      const source =
        error && typeof error === 'object'
          ? (error as { code?: string; driverError?: { code?: string } })
          : {};
      const code = source.driverError?.code ?? source.code;
      if (code === '42501')
        throw new ForbiddenError({
          code: 'CALENDARIOS_ACCESO_DENEGADO',
          message:
            'No tiene permiso para realizar esta operación de calendarios',
        });
      if (code === 'P0002')
        throw new NotFoundError({
          code: 'CALENDARIOS_NO_ENCONTRADO',
          message:
            'El calendario, la versión o la excepción indicada no existe',
        });
      if (code === '23505')
        throw new ConflictError({
          code: 'CALENDARIOS_DUPLICADO',
          message:
            'Ya existe un calendario con ese nombre o una excepción para esa fecha',
        });
      if (code === '40001' || code === '40P01')
        throw new ConflictError({
          code: 'CALENDARIOS_REVISION_OBSOLETA',
          message:
            'La configuración cambió; vuelva a cargar el calendario antes de guardar',
        });
      if (code === '55000')
        throw new ConflictError({
          code: 'CALENDARIOS_ESTADO_INCOMPATIBLE',
          message:
            'Revise que el calendario esté activo, que la versión sea editable y que no exista otro borrador',
        });
      if (
        code &&
        [
          '22023',
          '22007',
          '22008',
          '22P02',
          '22003',
          '23502',
          '23503',
          '23514',
        ].includes(code)
      ) {
        throw new InvalidInputError({
          code: 'CALENDARIOS_DATOS_INVALIDOS',
          message:
            'Revise los datos, los horarios y las referencias del calendario',
        });
      }
      // No exponer consultas, parámetros ni errores del driver en la respuesta HTTP.
      throw new InternalError({
        code: 'CALENDARIOS_ERROR_INTERNO',
        message: 'No se pudo completar la operación de calendarios',
      });
    }
  }
}
