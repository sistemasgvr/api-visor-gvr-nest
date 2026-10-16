import type {
  IControlOperativoRepository,
  ListarJornadasTrabajadorParams,
  ListarJornadasTrabajadorResult,
} from '../../../domain/repositories/control-operativo.repository.interface';

export class ListarJornadasTrabajadorUseCase {
  constructor(
    private readonly controlOperativoRepository: IControlOperativoRepository,
  ) {}

  async execute(
    params: ListarJornadasTrabajadorParams,
  ): Promise<ListarJornadasTrabajadorResult> {
    return this.controlOperativoRepository.listarJornadasTrabajador(params);
  }
}
