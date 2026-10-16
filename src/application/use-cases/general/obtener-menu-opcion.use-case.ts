import type { IMenuRepository } from '../../../domain/repositories/menu.repository.interface';
import { NotFoundError } from '../../errors/application.error';

export class ObtenerMenuOpcionUseCase {
  constructor(private readonly menuRepository: IMenuRepository) {}

  async execute(id: number): Promise<any> {
    const menuOpcion = await this.menuRepository.obtenerMenuOpcionPorId(id);

    if (!menuOpcion) {
      throw new NotFoundError('Opción de menú no encontrada');
    }

    return menuOpcion;
  }
}
