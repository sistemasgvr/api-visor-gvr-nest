import type { ICalendariosRepository } from '../../../../domain/repositories/calendarios.repository.interface';
import { InvalidInputError } from '../../../errors/application.error';

export class ObtenerDisponibilidadCalendarioUseCase {
  constructor(private readonly repository: ICalendariosRepository) {}

  execute(idUsuario: number, idVersion: number, desde: string, hasta: string) {
    const fecha = (value: string) => {
      const time = Date.parse(value + 'T00:00:00Z');
      if (
        !/^(?!0000)[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(value) ||
        !Number.isFinite(time) ||
        new Date(time).toISOString().slice(0, 10) !== value
      ) {
        throw new InvalidInputError(
          'Las fechas deben ser válidas y tener formato YYYY-MM-DD',
        );
      }
      return time;
    };
    const dias = (fecha(hasta) - fecha(desde)) / 86400000;
    if (dias < 0 || dias > 365) {
      throw new InvalidInputError(
        'El rango debe ser ordenado y de hasta 366 días inclusivos',
      );
    }

    return this.repository.disponibilidad(idUsuario, idVersion, desde, hasta);
  }
}
