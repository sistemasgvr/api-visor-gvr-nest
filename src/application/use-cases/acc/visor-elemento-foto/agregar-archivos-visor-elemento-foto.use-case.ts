import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ACC_VISOR_ELEMENTO_FOTO_REPOSITORY,
  MAX_VISOR_ELEMENTO_FOTO_ARCHIVOS,
  type IAccVisorElementoFotoRepository,
} from '../../../../domain/repositories/acc-visor-elemento-foto.repository.interface';
import type { AgregarArchivosVisorElementoFotoDto } from '../../../dtos/acc/visor-elemento-foto/visor-elemento-foto.dto';
import { normalizarArchivosVisorElementoFoto } from './visor-elemento-foto.util';

@Injectable()
export class AgregarArchivosVisorElementoFotoUseCase {
  constructor(
    @Inject(ACC_VISOR_ELEMENTO_FOTO_REPOSITORY)
    private readonly repository: IAccVisorElementoFotoRepository,
  ) {}

  async execute(
    id: number,
    dto: AgregarArchivosVisorElementoFotoDto,
    idUsuario: number,
  ) {
    const existing = await this.repository.obtenerPorId(id);
    if (!existing) {
      throw new NotFoundException('Anclaje de fotos no encontrado');
    }
    const archivos = normalizarArchivosVisorElementoFoto(dto.archivos);
    if (archivos.length === 0) {
      throw new BadRequestException('No hay imágenes para agregar');
    }
    if (existing.cantidadArchivos + archivos.length > MAX_VISOR_ELEMENTO_FOTO_ARCHIVOS) {
      throw new BadRequestException(
        `Máximo ${MAX_VISOR_ELEMENTO_FOTO_ARCHIVOS} imágenes por elemento`,
      );
    }
    try {
      await this.repository.agregarArchivos({
        idVisorElementoFoto: id,
        archivos,
        idUsuario,
      });
    } catch (err) {
      throw new BadRequestException(
        err instanceof Error ? err.message : 'No se pudieron agregar imágenes',
      );
    }
    return this.repository.obtenerPorId(id);
  }
}
