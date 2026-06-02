import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { IProyectoRepository } from '../../../domain/repositories/proyecto.repository.interface';
import { PROYECTO_REPOSITORY } from '../../../domain/repositories/proyecto.repository.interface';

@Injectable()
export class ObtenerEntregableProyectoUseCase {
  constructor(
    @Inject(PROYECTO_REPOSITORY)
    private readonly proyectoRepository: IProyectoRepository,
  ) {}

  async execute(idEntregable: number) {
    const entregable = await this.proyectoRepository.obtenerEntregablePorId(idEntregable);

    if (!entregable) {
      throw new NotFoundException('Entregable no encontrado');
    }

    return entregable;
  }
}
