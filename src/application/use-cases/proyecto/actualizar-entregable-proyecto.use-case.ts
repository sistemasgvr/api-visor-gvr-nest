import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import type {
  IProyectoRepository,
  ActualizarEntregableProyectoData,
} from '../../../domain/repositories/proyecto.repository.interface';
import { PROYECTO_REPOSITORY } from '../../../domain/repositories/proyecto.repository.interface';

@Injectable()
export class ActualizarEntregableProyectoUseCase {
  constructor(
    @Inject(PROYECTO_REPOSITORY)
    private readonly proyectoRepository: IProyectoRepository,
  ) {}

  async execute(
    idEntregable: number,
    data: ActualizarEntregableProyectoData,
    idUsuarioModificacion: number,
  ) {
    const resultado = await this.proyectoRepository.actualizarEntregableProyecto(
      idEntregable,
      data,
      idUsuarioModificacion,
    );

    if (!resultado?.success) {
      throw new BadRequestException(
        resultado?.message || 'Error al actualizar el entregable',
      );
    }

    return resultado;
  }
}
