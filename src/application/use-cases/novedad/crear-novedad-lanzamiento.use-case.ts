import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import type { INovedadRepository } from '../../../domain/repositories/novedad.repository.interface';
import { NOVEDAD_REPOSITORY } from '../../../domain/repositories/novedad.repository.interface';
import { CreateNovedadLanzamientoDto } from '../../dtos/novedad/create-novedad-lanzamiento.dto';
import {
  normalizarFechaPublicacionNovedad,
  normalizarFechaVigenciaNovedad,
} from '../../../shared/utils/novedad-dates.util';

@Injectable()
export class CrearNovedadLanzamientoUseCase {
  constructor(
    @Inject(NOVEDAD_REPOSITORY)
    private readonly novedadRepository: INovedadRepository,
  ) {}

  async execute(dto: CreateNovedadLanzamientoDto, idUsuarioCreacion: number) {
    const resultado = await this.novedadRepository.crearLanzamiento({
      titulo: dto.titulo,
      fechaPublicacion: normalizarFechaPublicacionNovedad(dto.fechaPublicacion),
      fechaVigenciaHasta: normalizarFechaVigenciaNovedad(dto.fechaVigenciaHasta),
      textoBotonCerrar: dto.textoBotonCerrar,
      idUsuarioCreacion,
    });

    if (!resultado || !resultado.success) {
      throw new BadRequestException(
        resultado?.message || 'Error al crear el lanzamiento',
      );
    }

    return {
      message: resultado.message,
      id: resultado.id_lanzamiento ?? resultado.idLanzamiento ?? resultado.id,
    };
  }
}
