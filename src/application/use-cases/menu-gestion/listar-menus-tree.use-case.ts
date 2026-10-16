import type { IMenuGestionRepository } from '../../../domain/repositories/menu-gestion.repository.interface';

export class ListarMenusTreeUseCase {
  constructor(private readonly menuRepository: IMenuGestionRepository) {}

  async execute() {
    return await this.menuRepository.listarMenusTree();
  }
}
