import type { IAccResourcesRepository } from '../../../../domain/repositories/acc-resources.repository.interface';
import { InvalidInputError } from '../../../errors/application.error';

export class EliminarRecursoUseCase {
  constructor(
    private readonly accResourcesRepository: IAccResourcesRepository,
  ) {}

  async execute(id: number, idUsuarioModificacion: number) {
    const resultado = await this.accResourcesRepository.eliminarRecurso(
      id,
      idUsuarioModificacion,
    );

    if (!resultado || !resultado.success) {
      throw new InvalidInputError(
        resultado?.message || 'Error al eliminar el recurso',
      );
    }

    return {
      message: resultado.message,
    };
  }
}
