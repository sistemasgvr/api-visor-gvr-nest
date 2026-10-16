import type {
  IControlOperativoRepository,
  ProyectoAccesoTrabajador,
} from '../../../domain/repositories/control-operativo.repository.interface';

export class ListarProyectosAccesoTrabajadorUseCase {
  constructor(
    private readonly controlOperativoRepository: IControlOperativoRepository,
  ) {}

  async execute(
    idTrabajador: number,
    soloVigentes = false,
  ): Promise<ProyectoAccesoTrabajador[]> {
    return this.controlOperativoRepository.listarProyectosAccesoTrabajador(
      idTrabajador,
      soloVigentes,
    );
  }
}
