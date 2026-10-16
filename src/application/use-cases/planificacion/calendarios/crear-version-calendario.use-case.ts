import type { ICalendariosRepository } from '../../../../domain/repositories/calendarios.repository.interface';

export class CrearVersionCalendarioUseCase {
  constructor(private readonly repository: ICalendariosRepository) {}

  execute(idUsuario: number, idVersionOrigen: number) {
    return this.repository.crearVersion(idUsuario, idVersionOrigen);
  }
}
