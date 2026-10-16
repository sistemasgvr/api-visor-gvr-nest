import type { IAccResourcesRepository } from '../../../../domain/repositories/acc-resources.repository.interface';
import { InvalidInputError } from '../../../errors/application.error';
import { ActualizarRecursoDto } from '../../../inputs/acc/resources/actualizar-recurso.dto';

export class ActualizarRecursoUseCase {
  constructor(
    private readonly accResourcesRepository: IAccResourcesRepository,
  ) {}

  async execute(
    id: number,
    dto: ActualizarRecursoDto,
    idUsuarioModificacion: number,
  ) {
    const resultado = await this.accResourcesRepository.actualizarRecurso(id, {
      name: dto.name,
      parent_id: dto.parent_id,
      account_id: dto.account_id,
      idUsuarioModificacion,
    });

    if (!resultado || !resultado.success) {
      throw new InvalidInputError(
        resultado?.message || 'Error al actualizar el recurso',
      );
    }

    return {
      message: resultado.message,
    };
  }
}
