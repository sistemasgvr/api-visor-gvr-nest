import type { ICalendariosRepository } from '../../../../domain/repositories/calendarios.repository.interface';
import type { EstadoCalendario } from '../../../../domain/entities/calendario.entity';

export class CambiarEstadoCalendarioUseCase {
  constructor(private readonly repository: ICalendariosRepository) {}

  execute(
    idUsuario: number,
    id: number,
    revision: number,
    estado: EstadoCalendario,
  ) {
    return this.repository.cambiarEstado(idUsuario, id, revision, estado);
  }
}
