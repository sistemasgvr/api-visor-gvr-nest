import type {
  ICalendariosRepository,
  ActualizarCalendarioData,
} from '../../../../domain/repositories/calendarios.repository.interface';

export class ActualizarCalendarioUseCase {
  constructor(private readonly repository: ICalendariosRepository) {}

  execute(idUsuario: number, id: number, data: ActualizarCalendarioData) {
    return this.repository.actualizar(idUsuario, id, data);
  }
}
