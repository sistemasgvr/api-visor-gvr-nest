import { type IAccVisorElementoFotoRepository } from '../../../../domain/repositories/acc-visor-elemento-foto.repository.interface';
import {
  InvalidInputError,
  NotFoundError,
} from '../../../errors/application.error';
import type { AgregarArchivosVisorElementoFotoDto } from '../../../inputs/acc/visor-elemento-foto/visor-elemento-foto.dto';
import { normalizarArchivosVisorElementoFoto } from './visor-elemento-foto.util';

export class AgregarArchivosVisorElementoFotoUseCase {
  constructor(private readonly repository: IAccVisorElementoFotoRepository) {}

  async execute(
    id: number,
    dto: AgregarArchivosVisorElementoFotoDto,
    idUsuario: number,
  ) {
    const existing = await this.repository.obtenerPorId(id);
    if (!existing) {
      throw new NotFoundError('Anclaje de fotos no encontrado');
    }
    const archivos = normalizarArchivosVisorElementoFoto(dto.archivos);
    if (archivos.length === 0) {
      throw new InvalidInputError('No hay imágenes para agregar');
    }
    try {
      await this.repository.agregarArchivos({
        idVisorElementoFoto: id,
        archivos,
        idUsuario,
      });
    } catch (err) {
      throw new InvalidInputError(
        err instanceof Error ? err.message : 'No se pudieron agregar imágenes',
      );
    }
    return this.repository.obtenerPorId(id);
  }
}
