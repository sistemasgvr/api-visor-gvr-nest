import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import type { INovedadRepository } from '../../../domain/repositories/novedad.repository.interface';
import { NOVEDAD_REPOSITORY } from '../../../domain/repositories/novedad.repository.interface';

@Injectable()
export class EliminarNovedadLanzamientoUseCase {
  constructor(
    @Inject(NOVEDAD_REPOSITORY)
    private readonly novedadRepository: INovedadRepository,
  ) {}

  async execute(id: number, idUsuarioModificacion: number) {
    const resultado = await this.novedadRepository.eliminarLanzamiento(
      id,
      idUsuarioModificacion,
    );

    if (!resultado || !resultado.success) {
      throw new BadRequestException(
        resultado?.message || 'Error al eliminar el lanzamiento',
      );
    }

    return { message: resultado.message };
  }
}
