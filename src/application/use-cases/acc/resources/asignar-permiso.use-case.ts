import type { IAccResourcesRepository } from '../../../../domain/repositories/acc-resources.repository.interface';
import { InvalidInputError } from '../../../errors/application.error';
import { AsignarPermisoDto } from '../../../inputs/acc/resources/asignar-permiso.dto';

export class AsignarPermisoUseCase {
  constructor(
    private readonly accResourcesRepository: IAccResourcesRepository,
  ) {}

  async execute(dto: AsignarPermisoDto, idUsuarioCreacion: number) {
    const resultado = await this.accResourcesRepository.asignarPermiso({
      role_id: dto.role_id,
      resource_id: dto.resource_id,
      idUsuarioCreacion,
    });

    if (!resultado || !resultado.success) {
      throw new InvalidInputError(
        resultado?.message || 'Error al asignar el permiso',
      );
    }

    return {
      id: resultado.id,
      message: resultado.message,
    };
  }
}
