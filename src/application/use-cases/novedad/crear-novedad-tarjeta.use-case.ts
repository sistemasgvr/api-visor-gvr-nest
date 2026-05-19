import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import type { INovedadRepository } from '../../../domain/repositories/novedad.repository.interface';
import { NOVEDAD_REPOSITORY } from '../../../domain/repositories/novedad.repository.interface';
import { CreateNovedadTarjetaDto } from '../../dtos/novedad/create-novedad-tarjeta.dto';

@Injectable()
export class CrearNovedadTarjetaUseCase {
  constructor(
    @Inject(NOVEDAD_REPOSITORY)
    private readonly novedadRepository: INovedadRepository,
  ) {}

  async execute(
    idNovedadLanzamiento: number,
    dto: CreateNovedadTarjetaDto,
    idUsuarioCreacion: number,
  ) {
    const resultado = await this.novedadRepository.crearTarjeta({
      idNovedadLanzamiento,
      ...dto,
      idUsuarioCreacion,
    });

    if (!resultado || !resultado.success) {
      throw new BadRequestException(
        resultado?.message || 'Error al crear la tarjeta',
      );
    }

    return {
      message: resultado.message,
      id: resultado.id,
    };
  }
}
