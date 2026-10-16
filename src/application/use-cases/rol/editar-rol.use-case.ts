import type { IRolRepository } from '../../../domain/repositories/rol.repository.interface';
import { InvalidInputError } from '../../errors/application.error';
import { UpdateRolDto } from '../../inputs/rol/update-rol.dto';

export class EditarRolUseCase {
  constructor(private readonly rolRepository: IRolRepository) {}

  async execute(
    idRol: number,
    updateDto: UpdateRolDto,
    idUsuarioModificacion: number,
  ) {
    const resultado = await this.rolRepository.editarRol({
      idRol,
      ...updateDto,
      idUsuarioModificacion,
    });

    if (!resultado || !resultado.success) {
      throw new InvalidInputError(
        resultado?.message || 'Error al editar el rol',
      );
    }

    return {
      message: resultado.message,
    };
  }
}
