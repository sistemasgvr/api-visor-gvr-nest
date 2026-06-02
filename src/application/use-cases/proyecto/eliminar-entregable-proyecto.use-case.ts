import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import type { IProyectoRepository } from '../../../domain/repositories/proyecto.repository.interface';
import { PROYECTO_REPOSITORY } from '../../../domain/repositories/proyecto.repository.interface';

@Injectable()
export class EliminarEntregableProyectoUseCase {
  constructor(
    @Inject(PROYECTO_REPOSITORY)
    private readonly proyectoRepository: IProyectoRepository,
  ) {}

  async execute(idEntregable: number, idUsuarioModificacion: number) {
    const resultado = await this.proyectoRepository.eliminarEntregableProyecto(
      idEntregable,
      idUsuarioModificacion,
    );

    if (!resultado?.success) {
      throw new BadRequestException(
        resultado?.message || 'Error al eliminar el entregable',
      );
    }

    return resultado;
  }
}
