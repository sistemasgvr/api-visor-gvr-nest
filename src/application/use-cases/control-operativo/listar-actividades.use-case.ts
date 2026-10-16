import type {
  IControlOperativoRepository,
  ListarActividadesParams,
  ListarActividadesResult,
} from '../../../domain/repositories/control-operativo.repository.interface';

export class ListarActividadesUseCase {
  constructor(
    private readonly controlOperativoRepository: IControlOperativoRepository,
  ) {}

  async execute(
    params: ListarActividadesParams,
  ): Promise<ListarActividadesResult> {
    return this.controlOperativoRepository.listarActividades(params);
  }
}
