import type { ICalendariosRepository } from '../../../../domain/repositories/calendarios.repository.interface';

export class PublicarVersionCalendarioUseCase {
  constructor(private readonly repository: ICalendariosRepository) {}

  execute(idUsuario: number, idVersion: number, revision: number) {
    return this.repository.publicarVersion(idUsuario, idVersion, revision);
  }
}
