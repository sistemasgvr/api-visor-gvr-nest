import type { INovedadRepository } from '../../../domain/repositories/novedad.repository.interface';
import { InvalidInputError } from '../../errors/application.error';
import { SincronizarRolesNovedadDto } from '../../inputs/novedad/sincronizar-roles-novedad.dto';

export class SincronizarRolesNovedadUseCase {
  constructor(private readonly novedadRepository: INovedadRepository) {}

  async execute(
    idNovedadLanzamiento: number,
    dto: SincronizarRolesNovedadDto,
    idUsuarioModificacion: number,
  ) {
    const resultado = await this.novedadRepository.sincronizarRoles({
      idNovedadLanzamiento,
      roles: dto.roles ?? [],
      idUsuarioModificacion,
    });

    if (!resultado || !resultado.success) {
      throw new InvalidInputError(
        resultado?.message || 'Error al sincronizar los roles',
      );
    }

    return {
      message: resultado.message,
      rolesFinales: resultado.roles_finales ?? resultado.rolesfinales,
    };
  }
}
