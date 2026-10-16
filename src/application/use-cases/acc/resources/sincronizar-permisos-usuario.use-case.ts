import type { IAccResourcesRepository } from '../../../../domain/repositories/acc-resources.repository.interface';
import { InvalidInputError } from '../../../errors/application.error';
import { SincronizarPermisosUsuarioDto } from '../../../inputs/acc/resources/sincronizar-permisos-usuario.dto';

export class SincronizarPermisosUsuarioUseCase {
  constructor(
    private readonly accResourcesRepository: IAccResourcesRepository,
  ) {}

  async execute(
    dto: SincronizarPermisosUsuarioDto,
    idUsuarioModificacion: number,
  ) {
    const resultado =
      await this.accResourcesRepository.sincronizarPermisosUsuario({
        user_id: dto.user_id,
        resource_ids: dto.resource_ids,
        idUsuarioModificacion,
      });

    if (!resultado || !resultado.success) {
      throw new InvalidInputError(
        resultado?.message || 'Error al sincronizar los permisos',
      );
    }

    return {
      asignados: resultado.asignados,
      message: resultado.message,
    };
  }
}
