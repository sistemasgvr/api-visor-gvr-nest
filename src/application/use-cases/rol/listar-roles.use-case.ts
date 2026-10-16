import type {
  IRolRepository,
  ListarRolesParams,
} from '../../../domain/repositories/rol.repository.interface';

export class ListarRolesUseCase {
  constructor(private readonly rolRepository: IRolRepository) {}

  async execute(params: ListarRolesParams) {
    return await this.rolRepository.listarRoles(params);
  }
}
