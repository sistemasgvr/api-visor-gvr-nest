import type {
  ICalendariosRepository,
  GuardarSemanaCalendarioData,
} from '../../../../domain/repositories/calendarios.repository.interface';
import { InvalidInputError } from '../../../errors/application.error';

export class GuardarSemanaCalendarioUseCase {
  constructor(private readonly repository: ICalendariosRepository) {}

  execute(
    idUsuario: number,
    idVersion: number,
    data: GuardarSemanaCalendarioData,
  ) {
    const dias = data.semana;
    if (
      dias.length !== 7 ||
      new Set(dias.map((dia) => dia.diasemana)).size !== 7
    ) {
      throw new InvalidInputError(
        'La semana debe contener los siete días, sin repetir',
      );
    }
    for (const dia of dias) {
      if (
        !Number.isInteger(dia.diasemana) ||
        dia.diasemana < 1 ||
        dia.diasemana > 7 ||
        typeof dia.laborable !== 'boolean' ||
        !Number.isInteger(dia.minutosrefrigerio) ||
        dia.minutosrefrigerio < 0 ||
        dia.minutosrefrigerio > 1439
      ) {
        throw new InvalidInputError('Día o refrigerio no válido');
      }
      if (!dia.laborable) {
        if (
          dia.horaentrada != null ||
          dia.horasalida != null ||
          dia.minutosrefrigerio !== 0
        ) {
          throw new InvalidInputError(
            'Un día no laborable requiere horas nulas y refrigerio cero',
          );
        }
        continue;
      }
      const formato = /^([01][0-9]|2[0-3]):[0-5][0-9]$/;
      if (
        !dia.horaentrada ||
        !dia.horasalida ||
        !formato.test(dia.horaentrada) ||
        !formato.test(dia.horasalida)
      ) {
        throw new InvalidInputError(
          'Las horas laborables deben tener formato HH:MM',
        );
      }
      const minutos = (hora: string) =>
        Number(hora.slice(0, 2)) * 60 + Number(hora.slice(3));
      const intervalo = minutos(dia.horasalida) - minutos(dia.horaentrada);
      if (intervalo <= 0 || dia.minutosrefrigerio >= intervalo) {
        throw new InvalidInputError(
          'La salida debe ser posterior a la entrada y el refrigerio menor al intervalo',
        );
      }
    }

    return this.repository.guardarSemana(idUsuario, idVersion, data);
  }
}
