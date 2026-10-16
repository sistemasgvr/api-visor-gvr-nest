import type { IMenuGestionRepository } from '../../../domain/repositories/menu-gestion.repository.interface';
import { InvalidInputError } from '../../errors/application.error';

export class EliminarMenuUseCase {
  constructor(private readonly menuRepository: IMenuGestionRepository) {}

  async execute(idMenu: number, idUsuarioModificacion: number) {
    const resultado = await this.menuRepository.eliminarMenu(
      idMenu,
      idUsuarioModificacion,
    );

    if (!resultado || !resultado.success) {
      throw new InvalidInputError(
        resultado?.message || 'Error al eliminar el menú',
      );
    }

    return {
      message: resultado.message,
    };
  }
}
