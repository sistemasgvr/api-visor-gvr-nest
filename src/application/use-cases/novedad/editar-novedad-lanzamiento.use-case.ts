import type { INovedadRepository } from '../../../domain/repositories/novedad.repository.interface';
import {
  normalizarFechaPublicacionNovedad,
  normalizarFechaVigenciaNovedad,
} from '../../../domain/utils/novedad-dates.util';
import { InvalidInputError } from '../../errors/application.error';
import { UpdateNovedadLanzamientoDto } from '../../inputs/novedad/update-novedad-lanzamiento.dto';

export class EditarNovedadLanzamientoUseCase {
  constructor(private readonly novedadRepository: INovedadRepository) {}

  async execute(
    id: number,
    dto: UpdateNovedadLanzamientoDto,
    idUsuarioModificacion: number,
  ) {
    const resultado = await this.novedadRepository.editarLanzamiento({
      id,
      titulo: dto.titulo,
      fechaPublicacion: normalizarFechaPublicacionNovedad(dto.fechaPublicacion),
      fechaVigenciaHasta: normalizarFechaVigenciaNovedad(
        dto.fechaVigenciaHasta,
      ),
      textoBotonCerrar: dto.textoBotonCerrar,
      idUsuarioModificacion,
    });

    if (!resultado || !resultado.success) {
      throw new InvalidInputError(
        resultado?.message || 'Error al actualizar el lanzamiento',
      );
    }

    return { message: resultado.message };
  }
}
