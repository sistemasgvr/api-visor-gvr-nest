import type { IProyectoRepository } from '../../../domain/repositories/proyecto.repository.interface';
import { InvalidInputError } from '../../errors/application.error';

export class RemoverAccesoProyectoUseCase {
  constructor(private readonly proyectoRepository: IProyectoRepository) {}

  async execute(
    idProyecto: number,
    idAcceso: number,
    idUsuarioModificacion: number,
  ) {
    const resultado = await this.proyectoRepository.removerAccesoProyecto(
      idAcceso,
      idUsuarioModificacion,
    );

    if (!resultado?.success) {
      throw new InvalidInputError(
        resultado?.message ?? 'Error al remover acceso',
      );
    }

    return { message: resultado.message };
  }
}
