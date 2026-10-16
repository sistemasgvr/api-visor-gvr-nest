import type { IRolRepository } from '../../../domain/repositories/rol.repository.interface';
import { InvalidInputError } from '../../errors/application.error';

export class EliminarRolUseCase {
  constructor(private readonly rolRepository: IRolRepository) {}

  async execute(idRol: number, idUsuarioModificacion: number) {
    const resultado = await this.rolRepository.eliminarRol(
      idRol,
      idUsuarioModificacion,
    );

    if (!resultado || !resultado.success) {
      throw new InvalidInputError(
        resultado?.message || 'Error al eliminar el rol',
      );
    }

    return {
      message: resultado.message,
    };
  }
}
