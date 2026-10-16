import type { IRolRepository } from '../../../domain/repositories/rol.repository.interface';

export class ListarRolesForListUseCase {
  constructor(private readonly rolRepository: IRolRepository) {}

  async execute() {
    return await this.rolRepository.listarRolesForList();
  }
}
