import type { IMenuGestionRepository } from '../../../domain/repositories/menu-gestion.repository.interface';
import { InvalidInputError } from '../../errors/application.error';
import { AsignarRolesMenuDto } from '../../inputs/menu-gestion/asignar-roles-menu.dto';

export class AsignarRolesMenuUseCase {
  constructor(private readonly menuRepository: IMenuGestionRepository) {}

  async execute(
    idMenu: number,
    asignarDto: AsignarRolesMenuDto,
    idUsuarioCreacion: number,
  ) {
    const resultado = await this.menuRepository.asignarRolesMenu({
      idMenu,
      roles: asignarDto.roles,
      idUsuarioCreacion,
    });

    if (!resultado || !resultado.success) {
      throw new InvalidInputError(
        resultado?.message || 'Error al asignar los roles',
      );
    }

    return {
      message: resultado.message,
    };
  }
}
