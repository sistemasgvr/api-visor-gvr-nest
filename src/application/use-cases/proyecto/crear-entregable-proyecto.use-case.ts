import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import type {
  IProyectoRepository,
  CrearEntregableProyectoData,
} from '../../../domain/repositories/proyecto.repository.interface';
import { PROYECTO_REPOSITORY } from '../../../domain/repositories/proyecto.repository.interface';

@Injectable()
export class CrearEntregableProyectoUseCase {
  constructor(
    @Inject(PROYECTO_REPOSITORY)
    private readonly proyectoRepository: IProyectoRepository,
  ) {}

  async execute(
    data: CrearEntregableProyectoData,
    idUsuarioCreacion: number,
  ) {
    const resultado = await this.proyectoRepository.crearEntregableProyecto(
      data.idProyecto,
      data,
      idUsuarioCreacion,
    );

    if (!resultado?.success) {
      throw new BadRequestException(
        resultado?.message || 'Error al crear el entregable',
      );
    }

    return resultado;
  }
}
