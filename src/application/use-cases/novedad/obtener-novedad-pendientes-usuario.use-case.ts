import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import type { INovedadRepository } from '../../../domain/repositories/novedad.repository.interface';
import { NOVEDAD_REPOSITORY } from '../../../domain/repositories/novedad.repository.interface';

@Injectable()
export class ObtenerNovedadPendientesUsuarioUseCase {
  constructor(
    @Inject(NOVEDAD_REPOSITORY)
    private readonly novedadRepository: INovedadRepository,
  ) {}

  async execute(idUsuario: number) {
    const resultado =
      await this.novedadRepository.obtenerPendientesUsuario(idUsuario);

    if (!resultado) {
      return [];
    }

    if (resultado.success === false) {
      throw new BadRequestException(
        resultado.message || 'Error al obtener novedades pendientes',
      );
    }

    return resultado.data ?? [];
  }
}
