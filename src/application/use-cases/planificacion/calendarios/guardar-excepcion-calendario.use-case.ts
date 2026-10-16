import type {
  ICalendariosRepository,
  GuardarExcepcionCalendarioData,
} from '../../../../domain/repositories/calendarios.repository.interface';

export class GuardarExcepcionCalendarioUseCase {
  constructor(private readonly repository: ICalendariosRepository) {}

  execute(
    idUsuario: number,
    idVersion: number,
    data: GuardarExcepcionCalendarioData,
    idExcepcion?: number,
  ) {
    return this.repository.guardarExcepcion(
      idUsuario,
      idVersion,
      data,
      idExcepcion,
    );
  }
}
