import type {
  ICalendariosRepository,
  CrearCalendarioData,
} from '../../../../domain/repositories/calendarios.repository.interface';

export class CrearCalendarioUseCase {
  constructor(private readonly repository: ICalendariosRepository) {}

  execute(idUsuario: number, data: CrearCalendarioData) {
    return this.repository.crear(idUsuario, data);
  }
}
