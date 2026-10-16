import type { IMenuGestionRepository } from '../../../domain/repositories/menu-gestion.repository.interface';
import { InvalidInputError } from '../../errors/application.error';
import { AsignarRolesMenuDto } from '../../inputs/menu-gestion/asignar-roles-menu.dto';

export class SincronizarRolesMenuUseCase {
  constructor(private readonly menuRepository: IMenuGestionRepository) {}

  async execute(
    idMenu: number,
    sincronizarDto: AsignarRolesMenuDto,
    idUsuarioModificacion: number,
  ) {
    const resultado = await this.menuRepository.sincronizarRolesMenu({
      idMenu,
      roles: sincronizarDto.roles,
      idUsuarioModificacion,
    });

    if (!resultado || !resultado.success) {
      throw new InvalidInputError(
        resultado?.message || 'Error al sincronizar los roles del menú',
      );
    }

    return {
      message: resultado.message,
    };
  }
}
