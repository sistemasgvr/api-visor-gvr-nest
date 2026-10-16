import type { IProyectoRepository } from '../../../domain/repositories/proyecto.repository.interface';
import { InvalidInputError } from '../../errors/application.error';
import { UpdateProyectoDto } from '../../inputs/proyecto/update-proyecto.dto';

export class EditarProyectoUseCase {
  constructor(private readonly proyectoRepository: IProyectoRepository) {}

  async execute(
    idProyecto: number,
    updateDto: UpdateProyectoDto,
    idUsuarioModificacion: number,
  ) {
    const resultado = await this.proyectoRepository.editarProyecto({
      idProyecto,
      ...updateDto,
      idUsuarioCreacion: idUsuarioModificacion, // Reuse for consistency
      idUsuarioModificacion,
    });

    if (!resultado || !resultado.success) {
      throw new InvalidInputError(
        resultado?.message || 'Error al editar el proyecto',
      );
    }

    return {
      message: resultado.message,
    };
  }
}
