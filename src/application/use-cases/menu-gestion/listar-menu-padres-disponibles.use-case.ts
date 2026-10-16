import type { IMenuGestionRepository } from '../../../domain/repositories/menu-gestion.repository.interface';

export class ListarMenuPadresDisponiblesUseCase {
  constructor(private readonly menuRepository: IMenuGestionRepository) {}

  async execute(idMenuActual?: number) {
    return await this.menuRepository.listarMenuPadresDisponibles(idMenuActual);
  }
}
