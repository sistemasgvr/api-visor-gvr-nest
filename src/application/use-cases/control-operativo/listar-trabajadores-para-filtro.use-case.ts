import type {
  IControlOperativoRepository,
  TrabajadorParaFiltro,
} from '../../../domain/repositories/control-operativo.repository.interface';

export class ListarTrabajadoresParaFiltroUseCase {
  constructor(
    private readonly controlOperativoRepository: IControlOperativoRepository,
  ) {}

  async execute(idTrabajador: number): Promise<TrabajadorParaFiltro[]> {
    return this.controlOperativoRepository.listarTrabajadoresParaFiltro(
      idTrabajador,
    );
  }
}
