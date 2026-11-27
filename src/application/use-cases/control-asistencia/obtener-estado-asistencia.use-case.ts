import type { IControlAsistenciaRepository } from '../../../domain/repositories/control-asistencia.repository.interface';

export class ObtenerEstadoAsistenciaUseCase {
  constructor(private readonly repository: IControlAsistenciaRepository) {}

  execute(idUsuario: number) {
    return this.repository.obtenerEstado(idUsuario);
  }
}
