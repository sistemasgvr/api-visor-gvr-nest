import type { ICalendariosRepository } from '../../../../domain/repositories/calendarios.repository.interface';

export class DuplicarCalendarioUseCase {
  constructor(private readonly repository: ICalendariosRepository) {}

  execute(idUsuario: number, idVersionOrigen: number, nombre: string) {
    return this.repository.duplicar(idUsuario, idVersionOrigen, nombre);
  }
}
