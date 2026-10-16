import type { IMenuGestionRepository } from '../../../domain/repositories/menu-gestion.repository.interface';
import { NotFoundError } from '../../errors/application.error';

export class ObtenerMenuUseCase {
  constructor(private readonly menuRepository: IMenuGestionRepository) {}

  async execute(idMenu: number) {
    const menu = await this.menuRepository.obtenerMenuPorId(idMenu);

    if (!menu) {
      throw new NotFoundError('Menú no encontrado');
    }

    return menu;
  }
}
