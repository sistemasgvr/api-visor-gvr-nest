import type { ICalendariosRepository } from '../../../../domain/repositories/calendarios.repository.interface';

export class EliminarFeriadoUseCase {
  constructor(private readonly repository: ICalendariosRepository) {}

  execute(idUsuario: number, idFeriado: number, revision: number) {
    return this.repository.eliminarFeriado(idUsuario, idFeriado, revision);
  }
}
