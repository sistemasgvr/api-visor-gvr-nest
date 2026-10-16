import type { IAccResourcesRepository } from '../../../../domain/repositories/acc-resources.repository.interface';
import { InvalidInputError } from '../../../errors/application.error';

export class RemoverPermisoUseCase {
  constructor(
    private readonly accResourcesRepository: IAccResourcesRepository,
  ) {}

  async execute(id: number, idUsuarioModificacion: number) {
    const resultado = await this.accResourcesRepository.removerPermiso(
      id,
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
