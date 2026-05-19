import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import type { INovedadRepository } from '../../../domain/repositories/novedad.repository.interface';
import { NOVEDAD_REPOSITORY } from '../../../domain/repositories/novedad.repository.interface';
import { UpdateNovedadLanzamientoDto } from '../../dtos/novedad/update-novedad-lanzamiento.dto';

@Injectable()
export class EditarNovedadLanzamientoUseCase {
  constructor(
    @Inject(NOVEDAD_REPOSITORY)
    private readonly novedadRepository: INovedadRepository,
  ) {}

  async execute(
    id: number,
    dto: UpdateNovedadLanzamientoDto,
    idUsuarioModificacion: number,
  ) {
    const resultado = await this.novedadRepository.editarLanzamiento({
      id,
      ...dto,
      idUsuarioModificacion,
    });

    if (!resultado || !resultado.success) {
      throw new BadRequestException(
        resultado?.message || 'Error al actualizar el lanzamiento',
      );
    }

    return { message: resultado.message };
  }
}
