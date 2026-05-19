import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import type { INovedadRepository } from '../../../domain/repositories/novedad.repository.interface';
import { NOVEDAD_REPOSITORY } from '../../../domain/repositories/novedad.repository.interface';
import { UpdateNovedadTarjetaDto } from '../../dtos/novedad/update-novedad-tarjeta.dto';

@Injectable()
export class EditarNovedadTarjetaUseCase {
  constructor(
    @Inject(NOVEDAD_REPOSITORY)
    private readonly novedadRepository: INovedadRepository,
  ) {}

  async execute(
    id: number,
    dto: UpdateNovedadTarjetaDto,
    idUsuarioModificacion: number,
  ) {
    const resultado = await this.novedadRepository.editarTarjeta({
      id,
      ...dto,
      idUsuarioModificacion,
    });

    if (!resultado || !resultado.success) {
      throw new BadRequestException(
        resultado?.message || 'Error al actualizar la tarjeta',
      );
    }

    return { message: resultado.message };
  }
}
