import type { IAccResourcesRepository } from '../../../../domain/repositories/acc-resources.repository.interface';
import { InvalidInputError } from '../../../errors/application.error';
import { AsignarPermisoUsuarioDto } from '../../../inputs/acc/resources/asignar-permiso-usuario.dto';

export class AsignarPermisoUsuarioUseCase {
  constructor(
    private readonly accResourcesRepository: IAccResourcesRepository,
  ) {}

  async execute(dto: AsignarPermisoUsuarioDto, idUsuarioCreacion: number) {
    const resultado = await this.accResourcesRepository.asignarPermisoUsuario({
      user_id: dto.user_id,
      resource_id: dto.resource_id,
      permission_level_id: dto.permission_level_id || 2, // Default: view_download
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
