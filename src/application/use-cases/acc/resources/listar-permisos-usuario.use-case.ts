import type {
  IAccResourcesRepository,
  ListarPermisosUsuarioParams,
} from '../../../../domain/repositories/acc-resources.repository.interface';
import { ListarPermisosUsuarioDto } from '../../../inputs/acc/resources/listar-permisos-usuario.dto';

export class ListarPermisosUsuarioUseCase {
  constructor(
    private readonly accResourcesRepository: IAccResourcesRepository,
  ) {}

  async execute(userId: number, dto: ListarPermisosUsuarioDto) {
    const params: ListarPermisosUsuarioParams = {
      userId,
      limit: dto.limit || 100,
      offset: dto.offset || 0,
    };

    return await this.accResourcesRepository.listarPermisosUsuario(params);
  }
}
