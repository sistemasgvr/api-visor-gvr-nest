import type { INovedadRepository } from '../../../domain/repositories/novedad.repository.interface';
import {
  normalizarFechaPublicacionNovedad,
  normalizarFechaVigenciaNovedad,
} from '../../../domain/utils/novedad-dates.util';
import { InvalidInputError } from '../../errors/application.error';
import { CreateNovedadLanzamientoDto } from '../../inputs/novedad/create-novedad-lanzamiento.dto';

export class CrearNovedadLanzamientoUseCase {
  constructor(private readonly novedadRepository: INovedadRepository) {}

  async execute(dto: CreateNovedadLanzamientoDto, idUsuarioCreacion: number) {
    const resultado = await this.novedadRepository.crearLanzamiento({
      titulo: dto.titulo,
      fechaPublicacion: normalizarFechaPublicacionNovedad(dto.fechaPublicacion),
      fechaVigenciaHasta: normalizarFechaVigenciaNovedad(
        dto.fechaVigenciaHasta,
      ),
      textoBotonCerrar: dto.textoBotonCerrar,
      idUsuarioCreacion,
    });

    if (!resultado || !resultado.success) {
      throw new InvalidInputError(
        resultado?.message || 'Error al crear el lanzamiento',
      );
    }

    return {
      message: resultado.message,
      id: resultado.id_lanzamiento ?? resultado.idLanzamiento ?? resultado.id,
    };
  }
}
