import type { INovedadRepository } from '../../../domain/repositories/novedad.repository.interface';
import { InvalidInputError } from '../../errors/application.error';

export class MarcarNovedadVistaUseCase {
  constructor(private readonly novedadRepository: INovedadRepository) {}

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
      throw new InvalidInputError(
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
