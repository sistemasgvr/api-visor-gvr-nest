import type { INovedadRepository } from '../../../domain/repositories/novedad.repository.interface';
import { InvalidInputError } from '../../errors/application.error';

export class EliminarNovedadLanzamientoUseCase {
  constructor(private readonly novedadRepository: INovedadRepository) {}

  async execute(id: number, idUsuarioModificacion: number) {
    const resultado = await this.novedadRepository.eliminarLanzamiento(
      id,
      idUsuarioModificacion,
    );

    if (!resultado || !resultado.success) {
      throw new InvalidInputError(
        resultado?.message || 'Error al eliminar el lanzamiento',
      );
    }

    return { message: resultado.message };
  }
}
