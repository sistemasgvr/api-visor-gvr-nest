import type {
  IControlOperativoRepository,
  ProyectoAccesoTrabajador,
} from '../../../domain/repositories/control-operativo.repository.interface';

export class ListarProyectosParaValidacionUseCase {
  constructor(
    private readonly controlOperativoRepository: IControlOperativoRepository,
  ) {}

  async execute(idTrabajador: number): Promise<ProyectoAccesoTrabajador[]> {
    if (idTrabajador == null || idTrabajador < 1) return [];
    return this.controlOperativoRepository.listarProyectosParaValidacion(
      idTrabajador,
    );
  }
}
