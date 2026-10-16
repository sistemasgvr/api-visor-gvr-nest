import type { IMenuGestionRepository } from '../../../domain/repositories/menu-gestion.repository.interface';

export class ListarRolesDisponiblesMenuUseCase {
  constructor(private readonly menuRepository: IMenuGestionRepository) {}

  async execute(idMenu: number) {
    return await this.menuRepository.listarRolesDisponibles(idMenu);
  }
}
