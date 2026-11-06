import { Logger } from '@nestjs/common';
import {
  ApplicationFailure,
  ConflictError,
  ForbiddenError,
  InternalError,
  InvalidInputError,
  NotFoundError,
  UnprocessableError,
} from '../../application/errors/application.error';
const logger = new Logger('PlanificacionRepository');
/** Compartido por las versiones de integración: nunca expone SQL ni parámetros. */
export async function ejecutarPlanificacion<T>(
  operation: () => Promise<T>,
): Promise<T> {
  try {
    return await operation();
  } catch (error: unknown) {
    if (error instanceof ApplicationFailure) throw error;
    const source = error as {
      code?: string;
      message?: string;
      driverError?: { code?: string; message?: string };
    } | null;
    const code = source?.driverError?.code ?? source?.code;
    const message = source?.driverError?.message ?? source?.message ?? '';
    const failure = (suffix: string, text: string) => ({
      code: 'PLANIFICACION_' + suffix,
      message: text,
    });
    if (code === '42501')
      throw new ForbiddenError(
        failure(
          'ACCESO_DENEGADO',
          'No tiene permiso para realizar esta operación',
        ),
      );
    if (code === 'P0002')
      throw new NotFoundError(
        failure('NO_ENCONTRADO', 'No se encontró el recurso de planificación'),
      );
    if (code === '40001' || code === '40P01')
      throw new ConflictError(
        failure(
          'REVISION_OBSOLETA',
          'La planificación cambió; vuelva a cargar antes de guardar',
        ),
      );
    if (code === '23505')
      throw new ConflictError(
        failure(
          'DUPLICADO',
          'Ya existe el plan, la persona o la dependencia indicada',
        ),
      );
    if (
      code === '22023' &&
      message.startsWith('Se requiere una opción única y activa')
    ) {
      logger.error(
        'Catálogo de planificación incompleto; verifique los seeds de listas',
      );
      throw new InternalError(
        failure(
          'CATALOGO_INCOMPLETO',
          'La configuración de planificación está incompleta',
        ),
      );
    }
    if (
      code &&
      [
        '22023',
        '22P02',
        '22007',
        '22008',
        '22003',
        '23502',
        '23503',
        '23514',
      ].includes(code)
    )
      throw new InvalidInputError(
        failure(
          'DATOS_INVALIDOS',
          'Revise los datos y las referencias de planificación',
        ),
      );
    if (code === 'P0001')
      throw new UnprocessableError(failure('REGLA_NEGOCIO', message));
    logger.error('No se pudo completar una operación de planificación');
    throw new InternalError(
      failure(
        'ERROR_INTERNO',
        'No se pudo completar la operación de planificación',
      ),
    );
  }
}
