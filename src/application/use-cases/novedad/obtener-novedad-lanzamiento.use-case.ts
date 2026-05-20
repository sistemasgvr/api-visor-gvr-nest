import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import type { INovedadRepository } from '../../../domain/repositories/novedad.repository.interface';
import { NOVEDAD_REPOSITORY } from '../../../domain/repositories/novedad.repository.interface';
import { MinioStorageService } from '../../../infrastructure/storage/minio-storage.service';
import { enrichNovedadTarjetasMediaUrls } from './novedad-tarjeta-media.helper';

@Injectable()
export class ObtenerNovedadLanzamientoUseCase {
  constructor(
    @Inject(NOVEDAD_REPOSITORY)
    private readonly novedadRepository: INovedadRepository,
    private readonly minioStorage: MinioStorageService,
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

    const data = resultado.data;
    await enrichNovedadTarjetasMediaUrls(data, this.minioStorage);
    return data;
  }
}
