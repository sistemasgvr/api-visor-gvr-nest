import type { IProyectoRepository } from '../../../domain/repositories/proyecto.repository.interface';
import { InvalidInputError } from '../../errors/application.error';

export class EliminarProyectoUseCase {
  constructor(private readonly proyectoRepository: IProyectoRepository) {}

  async execute(idProyecto: number, idUsuarioModificacion: number) {
    const resultado = await this.proyectoRepository.eliminarProyecto(
      idProyecto,
      idUsuarioModificacion,
    );

    if (!resultado || !resultado.success) {
      throw new InvalidInputError(
        resultado?.message || 'Error al eliminar el proyecto',
      );
    }

    return {
      message: resultado.message,
    };
  }
}
