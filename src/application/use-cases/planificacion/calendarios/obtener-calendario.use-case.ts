import type { ICalendariosRepository } from '../../../../domain/repositories/calendarios.repository.interface';

export class ObtenerCalendarioUseCase {
  constructor(private readonly repository: ICalendariosRepository) {}

  execute(idUsuario: number, id: number, idVersion?: number) {
    return this.repository.obtener(idUsuario, id, idVersion);
  }
}
