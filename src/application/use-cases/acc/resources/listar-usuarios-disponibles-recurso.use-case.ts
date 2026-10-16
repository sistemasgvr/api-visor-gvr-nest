import type {
  IAccResourcesRepository,
  ListarUsuariosDisponiblesRecursoParams,
} from '../../../../domain/repositories/acc-resources.repository.interface';
import { ListarUsuariosDisponiblesRecursoDto } from '../../../inputs/acc/resources/listar-usuarios-disponibles-recurso.dto';

export class ListarUsuariosDisponiblesRecursoUseCase {
  constructor(
    private readonly accResourcesRepository: IAccResourcesRepository,
  ) {}

  async execute(resourceId: number, dto: ListarUsuariosDisponiblesRecursoDto) {
    const params: ListarUsuariosDisponiblesRecursoParams = {
      resourceId,
      busqueda: dto.busqueda || '',
      limit: dto.limit || 100,
      offset: dto.offset || 0,
    };

    return await this.accResourcesRepository.listarUsuariosDisponiblesRecurso(
      params,
    );
  }
}
