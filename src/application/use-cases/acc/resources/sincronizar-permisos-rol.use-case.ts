import type { IAccResourcesRepository } from '../../../../domain/repositories/acc-resources.repository.interface';
import { InvalidInputError } from '../../../errors/application.error';
import { SincronizarPermisosRolDto } from '../../../inputs/acc/resources/sincronizar-permisos-rol.dto';

export class SincronizarPermisosRolUseCase {
  constructor(
    private readonly accResourcesRepository: IAccResourcesRepository,
  ) {}

  async execute(dto: SincronizarPermisosRolDto, idUsuarioModificacion: number) {
    const resultado = await this.accResourcesRepository.sincronizarPermisosRol({
      role_id: dto.role_id,
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
