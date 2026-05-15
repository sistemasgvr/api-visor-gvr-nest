import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { ITrabajadorRepository } from '../../../domain/repositories/trabajador.repository.interface';
import { TRABAJADOR_REPOSITORY } from '../../../domain/repositories/trabajador.repository.interface';
import { MinioStorageService } from '../../../infrastructure/storage/minio-storage.service';

export interface FirmaTrabajadorResult {
  urlFirma: string | null;
}

@Injectable()
export class ObtenerFirmaTrabajadorUseCase {
  constructor(
    @Inject(TRABAJADOR_REPOSITORY)
    private readonly trabajadorRepository: ITrabajadorRepository,
    private readonly minioStorage: MinioStorageService,
  ) {}

  async execute(idTrabajador: number): Promise<FirmaTrabajadorResult> {
    const row =
      await this.trabajadorRepository.obtenerUrlAlmacenadaFirmaPorIdTrabajador(
        idTrabajador,
      );

    if (row === null) {
      throw new NotFoundException('Trabajador no encontrado');
    }

    if (!row.url?.trim()) {
      return { urlFirma: null };
    }

    const viewUrl =
      await this.minioStorage.resolveViewUrlForEvidenciaStoredUrl(row.url);

    return { urlFirma: viewUrl };
  }
}
