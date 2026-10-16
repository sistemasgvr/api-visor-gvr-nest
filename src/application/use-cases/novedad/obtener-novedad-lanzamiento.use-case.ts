import type { INovedadRepository } from '../../../domain/repositories/novedad.repository.interface';
import {
  InvalidInputError,
  NotFoundError,
} from '../../errors/application.error';
import { MinioStoragePort } from '../../ports/minio-storage.port';
import { enrichNovedadTarjetasMediaUrls } from './novedad-tarjeta-media.helper';

export class ObtenerNovedadLanzamientoUseCase {
  constructor(
    private readonly novedadRepository: INovedadRepository,
    private readonly minioStorage: MinioStoragePort,
  ) {}

  async execute(id: number) {
    const resultado = await this.novedadRepository.obtenerLanzamiento(id);

    if (!resultado) {
      throw new NotFoundError('Lanzamiento no encontrado');
    }

    if (resultado.success === false) {
      throw new NotFoundError(resultado.message || 'Lanzamiento no encontrado');
    }

    if (!resultado.data) {
      throw new InvalidInputError('Respuesta inválida del servidor');
    }

    const data = resultado.data;
    await enrichNovedadTarjetasMediaUrls(data, this.minioStorage);
    return data;
  }
}
