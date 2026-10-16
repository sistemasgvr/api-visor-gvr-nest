import { type IAccVisorElementoFotoRepository } from '../../../../domain/repositories/acc-visor-elemento-foto.repository.interface';
import {
  InvalidInputError,
  NotFoundError,
} from '../../../errors/application.error';
import type { ActualizarVisorElementoFotoDto } from '../../../inputs/acc/visor-elemento-foto/visor-elemento-foto.dto';

export class ActualizarVisorElementoFotoUseCase {
  constructor(private readonly repository: IAccVisorElementoFotoRepository) {}

  async execute(
    id: number,
    dto: ActualizarVisorElementoFotoDto,
    idUsuario: number,
  ) {
    const existing = await this.repository.obtenerPorId(id);
    if (!existing) {
      throw new NotFoundError('Anclaje de fotos no encontrado');
    }
    try {
      await this.repository.actualizar({
        id,
        titulo: dto.titulo,
        descripcion: dto.descripcion,
        posicionX: dto.posicionX,
        posicionY: dto.posicionY,
        posicionZ: dto.posicionZ,
        nombreElemento: dto.nombreElemento,
        idUsuario,
      });
    } catch (err) {
      throw new InvalidInputError(
        err instanceof Error ? err.message : 'No se pudo actualizar',
      );
    }
    return this.repository.obtenerPorId(id);
  }
}
