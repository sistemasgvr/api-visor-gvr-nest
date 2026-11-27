import {
  TIPOS_MARCA_ASISTENCIA,
  type TipoMarcaAsistencia,
} from '../../../domain/entities/asistencia.entity';
import type { IControlAsistenciaRepository } from '../../../domain/repositories/control-asistencia.repository.interface';
import { InvalidInputError } from '../../errors/application.error';

export class MarcarAsistenciaUseCase {
  constructor(private readonly repository: IControlAsistenciaRepository) {}

  /** La hora la pone el servidor; el cliente solo indica qué marca registra. */
  execute(idUsuario: number, tipo: TipoMarcaAsistencia, motivo?: string | null) {
    if (!TIPOS_MARCA_ASISTENCIA.includes(tipo)) {
      throw new InvalidInputError({
        code: 'ASISTENCIA_DATOS_INVALIDOS',
        message: 'Tipo de marca no válido',
      });
    }
    const texto = motivo?.trim() || null;
    return this.repository.marcar(idUsuario, tipo, texto);
  }
}
