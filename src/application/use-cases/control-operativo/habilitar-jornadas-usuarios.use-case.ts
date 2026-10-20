import type {
  HabilitarJornadasUsuariosParams,
  IControlOperativoRepository,
} from '../../../domain/repositories/control-operativo.repository.interface';
import { InvalidInputError } from '../../errors/application.error';

/** Límites de los integer que reciben las funciones PostgreSQL. */
export function esEnteroPositivoPostgres(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    Number.isInteger(value) &&
    value > 0 &&
    value <= 2147483647
  );
}

function esFechaCalendario(value: unknown): value is string {
  if (
    typeof value !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
    value.startsWith('0000')
  )
    return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return (
    Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}

export class HabilitarJornadasUsuariosUseCase {
  constructor(private readonly repository: IControlOperativoRepository) {}

  execute(params: HabilitarJornadasUsuariosParams) {
    if (
      !Array.isArray(params.idTrabajadores) ||
      params.idTrabajadores.length === 0 ||
      !params.idTrabajadores.every(esEnteroPositivoPostgres)
    ) {
      throw new InvalidInputError('Seleccione al menos un trabajador válido');
    }
    if (
      !esFechaCalendario(params.fechaInicio) ||
      !esFechaCalendario(params.fechaFin) ||
      params.fechaInicio > params.fechaFin
    ) {
      throw new InvalidInputError(
        'Indique un rango de fechas válido en formato YYYY-MM-DD',
      );
    }
    if (!esEnteroPositivoPostgres(params.duracionMinutos)) {
      throw new InvalidInputError(
        'La duración debe ser un entero positivo en minutos',
      );
    }
    if (!esEnteroPositivoPostgres(params.idUsuarioHabilita)) {
      throw new InvalidInputError('El usuario que habilita es obligatorio');
    }
    return this.repository.habilitarJornadasUsuarios({
      ...params,
      idTrabajadores: [...new Set(params.idTrabajadores)],
    });
  }
}
