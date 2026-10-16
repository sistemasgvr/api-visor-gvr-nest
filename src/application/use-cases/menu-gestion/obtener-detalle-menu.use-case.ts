import type { IMenuGestionRepository } from '../../../domain/repositories/menu-gestion.repository.interface';
import { NotFoundError } from '../../errors/application.error';

export class ObtenerDetalleMenuUseCase {
  constructor(private readonly menuRepository: IMenuGestionRepository) {}

  async execute(idMenu: number) {
    const menu = await this.menuRepository.obtenerDetalleMenu(idMenu);

    if (!menu) {
      throw new NotFoundError('Menú no encontrado');
    }

    return menu;
  }
}
