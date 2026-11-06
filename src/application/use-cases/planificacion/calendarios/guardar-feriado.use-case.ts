import type {
  ICalendariosRepository,
  GuardarFeriadoData,
} from '../../../../domain/repositories/calendarios.repository.interface';
import { InvalidInputError } from '../../../errors/application.error';

export class GuardarFeriadoUseCase {
  constructor(private readonly repository: ICalendariosRepository) {}

  execute(idUsuario: number, data: GuardarFeriadoData, idFeriado?: number) {
    if (
      idFeriado !== undefined &&
      (!Number.isInteger(data.revision) || data.revision! < 1)
    ) {
      throw new InvalidInputError(
        'Se requiere la revisión actual del feriado para actualizarlo',
      );
    }
    return this.repository.guardarFeriado(idUsuario, data, idFeriado);
  }
}
