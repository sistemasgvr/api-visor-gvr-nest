import type { INovedadRepository } from '../../../domain/repositories/novedad.repository.interface';
import { InvalidInputError } from '../../errors/application.error';
import { MinioStoragePort } from '../../ports/minio-storage.port';
import { enrichNovedadLanzamientosListMediaUrls } from './novedad-tarjeta-media.helper';

export class ObtenerNovedadPendientesUsuarioUseCase {
  constructor(
    private readonly novedadRepository: INovedadRepository,
    private readonly minioStorage: MinioStoragePort,
  ) {}

  async execute(idUsuario: number) {
    const resultado =
      await this.novedadRepository.obtenerPendientesUsuario(idUsuario);

    if (!resultado) {
      return [];
    }

    if (resultado.success === false) {
      throw new InvalidInputError(
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
