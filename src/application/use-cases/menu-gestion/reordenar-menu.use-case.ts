import type { IMenuGestionRepository } from '../../../domain/repositories/menu-gestion.repository.interface';
import { InvalidInputError } from '../../errors/application.error';
import { ReordenarMenuDto } from '../../inputs/menu-gestion/reordenar-menu.dto';

export class ReordenarMenuUseCase {
  constructor(private readonly menuRepository: IMenuGestionRepository) {}

  async execute(
    idMenu: number,
    reordenarDto: ReordenarMenuDto,
    idUsuarioModificacion: number,
  ) {
    const resultado = await this.menuRepository.reordenarMenu({
      idMenu,
      ordenNuevo: reordenarDto.orden_nuevo,
      idUsuarioModificacion,
    });

    if (!resultado || !resultado.success) {
      throw new InvalidInputError(
        resultado?.message || 'Error al reordenar el menú',
      );
    }

    return {
      message: resultado.message,
    };
  }
}
