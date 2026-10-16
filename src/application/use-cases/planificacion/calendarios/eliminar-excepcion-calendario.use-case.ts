import type { ICalendariosRepository } from '../../../../domain/repositories/calendarios.repository.interface';

export class EliminarExcepcionCalendarioUseCase {
  constructor(private readonly repository: ICalendariosRepository) {}

  execute(
    idUsuario: number,
    idVersion: number,
    revision: number,
    idExcepcion: number,
  ) {
    return this.repository.eliminarExcepcion(
      idUsuario,
      idVersion,
      revision,
      idExcepcion,
    );
  }
}
