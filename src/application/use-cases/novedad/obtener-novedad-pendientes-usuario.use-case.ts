import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import type { INovedadRepository } from '../../../domain/repositories/novedad.repository.interface';
import { NOVEDAD_REPOSITORY } from '../../../domain/repositories/novedad.repository.interface';
import { MinioStorageService } from '../../../infrastructure/storage/minio-storage.service';
import { enrichNovedadLanzamientosListMediaUrls } from './novedad-tarjeta-media.helper';

@Injectable()
export class ObtenerNovedadPendientesUsuarioUseCase {
  constructor(
    @Inject(NOVEDAD_REPOSITORY)
    private readonly novedadRepository: INovedadRepository,
    private readonly minioStorage: MinioStorageService,
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

    const list = resultado.data ?? [];
    if (Array.isArray(list) && list.length) {
      await enrichNovedadLanzamientosListMediaUrls(list, this.minioStorage);
    }
    return list;
  }
}
