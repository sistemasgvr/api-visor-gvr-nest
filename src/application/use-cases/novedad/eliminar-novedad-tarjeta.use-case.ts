import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import type { INovedadRepository } from '../../../domain/repositories/novedad.repository.interface';
import { NOVEDAD_REPOSITORY } from '../../../domain/repositories/novedad.repository.interface';
import { NovedadTarjetaMediaStorageService } from '../../../infrastructure/services/novedad-tarjeta-media-storage.service';

@Injectable()
export class EliminarNovedadTarjetaUseCase {
  constructor(
    @Inject(NOVEDAD_REPOSITORY)
    private readonly novedadRepository: INovedadRepository,
    private readonly novedadTarjetaMediaStorage: NovedadTarjetaMediaStorageService,
  ) {}

  async execute(id: number, idUsuarioModificacion: number) {
    const urlArchivo =
      await this.novedadRepository.obtenerArchivoUrlPorTarjeta(id);

    const resultado = await this.novedadRepository.eliminarTarjeta(
      id,
      idUsuarioModificacion,
    );

    if (!resultado || !resultado.success) {
      throw new BadRequestException(
        resultado?.message || 'Error al eliminar la tarjeta',
      );
    }

    if (urlArchivo) {
      await this.novedadTarjetaMediaStorage.deleteByStoredUrl(urlArchivo);
    }

    return { message: resultado.message };
  }
}
