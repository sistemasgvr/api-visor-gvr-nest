import type {
  IAccResourcesRepository,
  ListarRecursosParams,
} from '../../../../domain/repositories/acc-resources.repository.interface';
import { ListarRecursosDto } from '../../../inputs/acc/resources/listar-recursos.dto';

export class ListarRecursosUseCase {
  constructor(
    private readonly accResourcesRepository: IAccResourcesRepository,
  ) {}

  async execute(dto: ListarRecursosDto) {
    const params: ListarRecursosParams = {
      busqueda: dto.busqueda || '',
      resourceType: dto.resource_type || '',
      limit: dto.limit || 10,
      offset: dto.offset || 0,
    };

    return await this.accResourcesRepository.listarRecursos(params);
  }
}
