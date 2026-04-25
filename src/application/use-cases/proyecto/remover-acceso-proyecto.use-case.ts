import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import type { IProyectoRepository } from '../../../domain/repositories/proyecto.repository.interface';
import { PROYECTO_REPOSITORY } from '../../../domain/repositories/proyecto.repository.interface';

@Injectable()
export class RemoverAccesoProyectoUseCase {
  constructor(
    @Inject(PROYECTO_REPOSITORY)
    private readonly proyectoRepository: IProyectoRepository,
  ) {}

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
      throw new BadRequestException(
        resultado?.message ?? 'Error al remover acceso',
      );
    }

    return { message: resultado.message };
  }
}
