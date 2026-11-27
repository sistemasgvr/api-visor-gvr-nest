import type { IControlAsistenciaRepository } from '../../../domain/repositories/control-asistencia.repository.interface';

export class ListarAsistenciaMesUseCase {
  constructor(private readonly repository: IControlAsistenciaRepository) {}

  /** idTrabajador null = el propio colaborador. Ver a otra persona se autoriza antes, en el borde HTTP. */
  execute(
    idUsuario: number,
    idTrabajador: number | null,
    anio: number,
    mes: number,
  ) {
    return this.repository.listarMes(idUsuario, idTrabajador, anio, mes);
  }
}
