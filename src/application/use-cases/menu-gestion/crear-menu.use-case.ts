import type { IMenuGestionRepository } from '../../../domain/repositories/menu-gestion.repository.interface';
import { InvalidInputError } from '../../errors/application.error';
import { CreateMenuDto } from '../../inputs/menu-gestion/create-menu.dto';

export class CrearMenuUseCase {
  constructor(private readonly menuRepository: IMenuGestionRepository) {}

  async execute(createDto: CreateMenuDto, idUsuarioCreacion: number) {
    const resultado = await this.menuRepository.crearMenu({
      ...createDto,
      idUsuarioCreacion,
    });

    if (!resultado || !resultado.success) {
      throw new InvalidInputError(
        resultado?.message || 'Error al crear el menú',
      );
    }

    return {
      message: resultado.message,
      id_menu: resultado.idmenu ?? resultado.id_menu,
    };
  }
}
