import type { IProyectoRepository } from '../../../domain/repositories/proyecto.repository.interface';
import { InvalidInputError } from '../../errors/application.error';
import { AsignarAccesoProyectoDto } from '../../inputs/proyecto/asignar-acceso-proyecto.dto';

export class AsignarAccesoProyectoUseCase {
  constructor(private readonly proyectoRepository: IProyectoRepository) {}

  async execute(
    idProyecto: number,
    dto: AsignarAccesoProyectoDto,
    idUsuarioCreacion: number,
  ) {
    const resultado = await this.proyectoRepository.asignarAccesoProyecto(
      idProyecto,
      dto.idUsuario,
      dto.idNivelAcceso ?? null,
      idUsuarioCreacion,
    );

    if (!resultado?.success) {
      throw new InvalidInputError(
        resultado?.message ?? 'Error al asignar acceso',
      );
    }

    return {
      message: resultado.message,
      id: resultado.id,
    };
  }
}
