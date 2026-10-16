import type { IMenuGestionRepository } from '../../../domain/repositories/menu-gestion.repository.interface';
import { InvalidInputError } from '../../errors/application.error';

export class RemoverRolMenuUseCase {
  constructor(private readonly menuRepository: IMenuGestionRepository) {}

  async execute(idMenu: number, idRol: number, idUsuarioModificacion: number) {
    const resultado = await this.menuRepository.removerRolMenu(
      idMenu,
      idRol,
      idUsuarioModificacion,
    );

    if (!resultado || !resultado.success) {
      throw new InvalidInputError(
        resultado?.message || 'Error al remover el rol del menú',
      );
    }

    return {
      message: resultado.message,
    };
  }
}
