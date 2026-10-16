import type { IMenuGestionRepository } from '../../../domain/repositories/menu-gestion.repository.interface';
import { InvalidInputError } from '../../errors/application.error';
import { AsignarRolMenuDto } from '../../inputs/menu-gestion/asignar-rol-menu.dto';

export class AsignarRolMenuUseCase {
  constructor(private readonly menuRepository: IMenuGestionRepository) {}

  async execute(
    idMenu: number,
    asignarDto: AsignarRolMenuDto,
    idUsuarioCreacion: number,
  ) {
    const resultado = await this.menuRepository.asignarRolMenu({
      idMenu,
      idRol: asignarDto.id_rol,
      idUsuarioCreacion,
    });

    if (!resultado || !resultado.success) {
      throw new InvalidInputError(
        resultado?.message || 'Error al asignar el rol',
      );
    }

    return {
      message: resultado.message,
    };
  }
}
