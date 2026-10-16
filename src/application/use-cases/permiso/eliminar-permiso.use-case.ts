import type { IPermisoRepository } from '../../../domain/repositories/permiso.repository.interface';
import { InvalidInputError } from '../../errors/application.error';

export class EliminarPermisoUseCase {
  constructor(private readonly permisoRepository: IPermisoRepository) {}

  async execute(idPermiso: number, idUsuarioModificacion: number) {
    const resultado = await this.permisoRepository.eliminarPermiso(
      idPermiso,
      idUsuarioModificacion,
    );

    if (!resultado || !resultado.success) {
      throw new InvalidInputError(
        resultado?.message || 'Error al eliminar el permiso',
      );
    }

    return {
      message: resultado.message,
    };
  }
}
