import type {
  IControlOperativoRepository,
  ProyectoAccesoTrabajador,
} from '../../../domain/repositories/control-operativo.repository.interface';

export class ListarProyectosAccesoTrabajadorUseCase {
  constructor(
    private readonly controlOperativoRepository: IControlOperativoRepository,
  ) {}

  /** `verTodos`: el permiso de la pantalla tiene alcance «todos». */
  async execute(
    idTrabajador: number,
    soloVigentes = false,
    verTodos = false,
  ): Promise<ProyectoAccesoTrabajador[]> {
    return this.controlOperativoRepository.listarProyectosAccesoTrabajador(
      idTrabajador,
      soloVigentes,
      verTodos,
    );
  }
}
