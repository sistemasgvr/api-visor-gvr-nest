import type {
  IAccResourcesRepository,
  ListarPermisosRolParams,
} from '../../../../domain/repositories/acc-resources.repository.interface';
import { ListarPermisosRolDto } from '../../../inputs/acc/resources/listar-permisos-rol.dto';

export class ListarPermisosRolUseCase {
  constructor(
    private readonly accResourcesRepository: IAccResourcesRepository,
  ) {}

  async execute(roleId: number, dto: ListarPermisosRolDto) {
    const params: ListarPermisosRolParams = {
      roleId,
      limit: dto.limit || 100,
      offset: dto.offset || 0,
    };

    return await this.accResourcesRepository.listarPermisosRol(params);
  }
}
