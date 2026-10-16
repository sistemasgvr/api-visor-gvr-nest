import type {
  ICalendariosRepository,
  ListarCalendariosParams,
} from '../../../../domain/repositories/calendarios.repository.interface';

export class ListarCalendariosUseCase {
  constructor(private readonly repository: ICalendariosRepository) {}

  execute(idUsuario: number, params: ListarCalendariosParams) {
    return this.repository.listar(idUsuario, params);
  }
}
