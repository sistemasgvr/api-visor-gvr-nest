import type { ICalendariosRepository } from '../../../../domain/repositories/calendarios.repository.interface';

export class ObtenerFeriadoUseCase {
  constructor(private readonly repository: ICalendariosRepository) {}

  execute(idUsuario: number, idFeriado: number) {
    return this.repository.obtenerFeriado(idUsuario, idFeriado);
  }
}
