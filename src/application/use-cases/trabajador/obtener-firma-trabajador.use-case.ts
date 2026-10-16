import type { ITrabajadorRepository } from '../../../domain/repositories/trabajador.repository.interface';
import { NotFoundError } from '../../errors/application.error';
import { MinioStoragePort } from '../../ports/minio-storage.port';

export interface FirmaTrabajadorResult {
  urlFirma: string | null;
}

export class ObtenerFirmaTrabajadorUseCase {
  constructor(
    private readonly trabajadorRepository: ITrabajadorRepository,
    private readonly minioStorage: MinioStoragePort,
  ) {}

  async execute(idTrabajador: number): Promise<FirmaTrabajadorResult> {
    const row =
      await this.trabajadorRepository.obtenerUrlAlmacenadaFirmaPorIdTrabajador(
        idTrabajador,
      );

    if (row === null) {
      throw new NotFoundError('Trabajador no encontrado');
    }

    if (!row.url?.trim()) {
      return { urlFirma: null };
    }

    const viewUrl = await this.minioStorage.resolveViewUrlForEvidenciaStoredUrl(
      row.url,
    );

    return { urlFirma: viewUrl };
  }
}
