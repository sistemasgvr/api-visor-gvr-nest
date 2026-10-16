import type { INovedadRepository } from '../../../domain/repositories/novedad.repository.interface';
import { InvalidInputError } from '../../errors/application.error';
import { NovedadTarjetaMediaStoragePort } from '../../ports/novedad-tarjeta-media-storage.port';

export class EliminarNovedadTarjetaUseCase {
  constructor(
    private readonly novedadRepository: INovedadRepository,
    private readonly novedadTarjetaMediaStorage: NovedadTarjetaMediaStoragePort,
  ) {}

  async execute(id: number, idUsuarioModificacion: number) {
    const urlArchivo =
      await this.novedadRepository.obtenerArchivoUrlPorTarjeta(id);

    const resultado = await this.novedadRepository.eliminarTarjeta(
      id,
      idUsuarioModificacion,
    );

    if (!resultado || !resultado.success) {
      throw new InvalidInputError(
        resultado?.message || 'Error al eliminar la tarjeta',
      );
    }

    if (urlArchivo) {
      await this.novedadTarjetaMediaStorage.deleteByStoredUrl(urlArchivo);
    }

    return { message: resultado.message };
  }
}
