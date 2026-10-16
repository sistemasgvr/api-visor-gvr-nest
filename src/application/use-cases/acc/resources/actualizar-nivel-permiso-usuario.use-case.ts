import type { IAccResourcesRepository } from '../../../../domain/repositories/acc-resources.repository.interface';
import { InvalidInputError } from '../../../errors/application.error';
import { ActualizarNivelPermisoUsuarioDto } from '../../../inputs/acc/resources/actualizar-nivel-permiso-usuario.dto';

export class ActualizarNivelPermisoUsuarioUseCase {
  constructor(
    private readonly accResourcesRepository: IAccResourcesRepository,
  ) {}

  async execute(
    userAccAccessId: number,
    dto: ActualizarNivelPermisoUsuarioDto,
    idUsuarioModificacion: number,
  ) {
    const resultado =
      await this.accResourcesRepository.actualizarNivelPermisoUsuario({
        userAccAccessId,
        permission_level_id: dto.permission_level_id,
        idUsuarioModificacion,
      });

    if (!resultado || !resultado.success) {
      throw new InvalidInputError(
        resultado?.message || 'Error al actualizar el nivel de permiso',
      );
    }

    return {
      message: resultado.message,
    };
  }
}
