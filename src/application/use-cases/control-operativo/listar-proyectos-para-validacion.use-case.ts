import type {
  IControlOperativoRepository,
  ProyectoAccesoTrabajador,
} from '../../../domain/repositories/control-operativo.repository.interface';

export class ListarProyectosParaValidacionUseCase {
  constructor(
    private readonly controlOperativoRepository: IControlOperativoRepository,
  ) {}

  /** `verTodos`: `control_operativo.validacion.ver` con alcance «todos». */
  async execute(
    idTrabajador: number,
    verTodos = false,
  ): Promise<ProyectoAccesoTrabajador[]> {
    if (idTrabajador == null || idTrabajador < 1) return [];
    return this.controlOperativoRepository.listarProyectosParaValidacion(
      idTrabajador,
      verTodos,
    );
  }
}
