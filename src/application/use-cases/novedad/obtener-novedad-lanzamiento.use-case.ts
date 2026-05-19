import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import type { INovedadRepository } from '../../../domain/repositories/novedad.repository.interface';
import { NOVEDAD_REPOSITORY } from '../../../domain/repositories/novedad.repository.interface';

@Injectable()
export class ObtenerNovedadLanzamientoUseCase {
  constructor(
    @Inject(NOVEDAD_REPOSITORY)
    private readonly novedadRepository: INovedadRepository,
  ) {}

  async execute(id: number) {
    const resultado = await this.novedadRepository.obtenerLanzamiento(id);

    if (!resultado) {
      throw new NotFoundException('Lanzamiento no encontrado');
    }

    if (resultado.success === false) {
      throw new NotFoundException(
        resultado.message || 'Lanzamiento no encontrado',
      );
    }

    if (!resultado.data) {
      throw new BadRequestException('Respuesta inválida del servidor');
    }

    return resultado.data;
  }
}
