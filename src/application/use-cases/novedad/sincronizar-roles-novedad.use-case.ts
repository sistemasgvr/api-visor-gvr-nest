import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import type { INovedadRepository } from '../../../domain/repositories/novedad.repository.interface';
import { NOVEDAD_REPOSITORY } from '../../../domain/repositories/novedad.repository.interface';
import { SincronizarRolesNovedadDto } from '../../dtos/novedad/sincronizar-roles-novedad.dto';

@Injectable()
export class SincronizarRolesNovedadUseCase {
  constructor(
    @Inject(NOVEDAD_REPOSITORY)
    private readonly novedadRepository: INovedadRepository,
  ) {}

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
      throw new BadRequestException(
        resultado?.message || 'Error al sincronizar los roles',
      );
    }

    return {
      message: resultado.message,
      rolesFinales: resultado.roles_finales ?? resultado.rolesfinales,
    };
  }
}
