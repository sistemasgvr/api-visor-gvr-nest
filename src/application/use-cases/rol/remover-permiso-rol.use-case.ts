import type { IRolRepository } from '../../../domain/repositories/rol.repository.interface';
import { InvalidInputError } from '../../errors/application.error';

export class RemoverPermisoRolUseCase {
  constructor(private readonly rolRepository: IRolRepository) {}

  async execute(
    idRol: number,
    idPermiso: number,
    idUsuarioModificacion: number,
  ) {
    const resultado = await this.rolRepository.removerPermisoRol(
      idRol,
      idPermiso,
      idUsuarioModificacion,
    );

    if (!resultado || !resultado.success) {
      throw new InvalidInputError(
        resultado?.message || 'Error al remover el permiso',
      );
    }

    return {
      message: resultado.message,
    };
  }
}
