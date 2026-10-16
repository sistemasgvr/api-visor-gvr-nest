import type { IProyectoRepository } from '../../../domain/repositories/proyecto.repository.interface';
import { NotFoundError } from '../../errors/application.error';

export class ObtenerEntregableProyectoUseCase {
  constructor(private readonly proyectoRepository: IProyectoRepository) {}

  async execute(idEntregable: number) {
    const entregable =
      await this.proyectoRepository.obtenerEntregablePorId(idEntregable);

    if (!entregable) {
      throw new NotFoundError('Entregable no encontrado');
    }

    return entregable;
  }
}
