import type { IProyectoRepository } from '../../../domain/repositories/proyecto.repository.interface';
import { InvalidInputError } from '../../errors/application.error';
import { ActualizarNivelAccesoProyectoDto } from '../../inputs/proyecto/actualizar-nivel-acceso-proyecto.dto';

export class ActualizarNivelAccesoProyectoUseCase {
  constructor(private readonly proyectoRepository: IProyectoRepository) {}

  async execute(
    idProyecto: number,
    idAcceso: number,
    dto: ActualizarNivelAccesoProyectoDto,
    idUsuarioModificacion: number,
  ) {
    const resultado =
      await this.proyectoRepository.actualizarNivelAccesoProyecto(
        idAcceso,
        dto.idNivelAcceso,
        idUsuarioModificacion,
      );

    if (!resultado?.success) {
      throw new InvalidInputError(
        resultado?.message ?? 'Error al actualizar nivel de acceso',
      );
    }

    return { message: resultado.message };
  }
}
