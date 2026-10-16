import type { IMenuGestionRepository } from '../../../domain/repositories/menu-gestion.repository.interface';
import { InvalidInputError } from '../../errors/application.error';
import { UpdateMenuDto } from '../../inputs/menu-gestion/update-menu.dto';

export class EditarMenuUseCase {
  constructor(private readonly menuRepository: IMenuGestionRepository) {}

  async execute(
    idMenu: number,
    updateDto: UpdateMenuDto,
    idUsuarioModificacion: number,
  ) {
    const resultado = await this.menuRepository.editarMenu({
      idMenu,
      ...updateDto,
      idUsuarioModificacion,
    });

    if (!resultado || !resultado.success) {
      throw new InvalidInputError(
        resultado?.message || 'Error al editar el menú',
      );
    }

    return {
      message: resultado.message,
    };
  }
}
