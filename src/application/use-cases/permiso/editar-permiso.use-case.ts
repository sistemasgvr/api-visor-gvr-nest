import type { IPermisoRepository } from '../../../domain/repositories/permiso.repository.interface';
import { InvalidInputError } from '../../errors/application.error';
import { UpdatePermisoDto } from '../../inputs/permiso/update-permiso.dto';

export class EditarPermisoUseCase {
  constructor(private readonly permisoRepository: IPermisoRepository) {}

  async execute(
    idPermiso: number,
    updateDto: UpdatePermisoDto,
    idUsuarioModificacion: number,
  ) {
    const resultado = await this.permisoRepository.editarPermiso({
      idPermiso,
      ...updateDto,
      idUsuarioModificacion,
    });

    if (!resultado || !resultado.success) {
      throw new InvalidInputError(
        resultado?.message || 'Error al editar el permiso',
      );
    }

    return {
      message: resultado.message,
    };
  }
}
