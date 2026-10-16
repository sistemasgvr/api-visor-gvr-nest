import type { IMenuGestionRepository } from '../../../domain/repositories/menu-gestion.repository.interface';
import { InvalidInputError } from '../../errors/application.error';
import { MoverMenuDto } from '../../inputs/menu-gestion/mover-menu.dto';

export class MoverMenuUseCase {
  constructor(private readonly menuRepository: IMenuGestionRepository) {}

  async execute(
    idMenu: number,
    moverDto: MoverMenuDto,
    idUsuarioModificacion: number,
  ) {
    const resultado = await this.menuRepository.moverMenu({
      idMenu,
      idPadreNuevo: moverDto.id_padre_nuevo,
      idUsuarioModificacion,
    });

    if (!resultado || !resultado.success) {
      throw new InvalidInputError(
        resultado?.message || 'Error al mover el menú',
      );
    }

    return {
      message: resultado.message,
    };
  }
}
