import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import type { INovedadRepository } from '../../../domain/repositories/novedad.repository.interface';
import { NOVEDAD_REPOSITORY } from '../../../domain/repositories/novedad.repository.interface';

@Injectable()
export class MarcarNovedadVistaUseCase {
  constructor(
    @Inject(NOVEDAD_REPOSITORY)
    private readonly novedadRepository: INovedadRepository,
  ) {}

  async execute(
    idUsuario: number,
    idNovedadLanzamiento: number,
    idUsuarioAuditoria?: number,
  ) {
    const resultado = await this.novedadRepository.marcarVista(
      idUsuario,
      idNovedadLanzamiento,
      idUsuarioAuditoria,
    );

    if (!resultado || resultado.success === false) {
      throw new BadRequestException(
        resultado?.message || 'Error al marcar la novedad como vista',
      );
    }

    return {
      message: resultado.message,
      idUsuario: resultado.idUsuario ?? resultado.idusuario,
      idNovedadLanzamiento:
        resultado.idNovedadLanzamiento ?? resultado.idnovedadlanzamiento,
    };
  }
}
