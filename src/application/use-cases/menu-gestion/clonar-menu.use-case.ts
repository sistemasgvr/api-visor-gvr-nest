import type { IMenuGestionRepository } from '../../../domain/repositories/menu-gestion.repository.interface';
import { InvalidInputError } from '../../errors/application.error';
import { ClonarMenuDto } from '../../inputs/menu-gestion/clonar-menu.dto';

export class ClonarMenuUseCase {
  constructor(private readonly menuRepository: IMenuGestionRepository) {}

  async execute(
    idMenu: number,
    cloneDto: ClonarMenuDto,
    idUsuarioCreacion: number,
  ) {
    const resultado = await this.menuRepository.clonarMenu({
      idMenu,
      nombreNuevo: cloneDto.nombre_nuevo,
      idPadreNuevo: cloneDto.id_padre_nuevo,
      clonarRoles: cloneDto.clonar_roles ?? true,
      idUsuarioCreacion,
    });

    if (!resultado || !resultado.success) {
      throw new InvalidInputError(
        resultado?.message || 'Error al clonar el menú',
      );
    }

    return {
      message: resultado.message,
      id_menu_nuevo: resultado.id_menu_nuevo,
    };
  }
}
