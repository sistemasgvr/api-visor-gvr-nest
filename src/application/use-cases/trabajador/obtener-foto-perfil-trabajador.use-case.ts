import type { ITrabajadorRepository } from '../../../domain/repositories/trabajador.repository.interface';
import { NotFoundError } from '../../errors/application.error';
import { MinioStoragePort } from '../../ports/minio-storage.port';

export interface FotoPerfilTrabajadorResult {
  /** URL lista para mostrar (firmada / pública según MinIO). `null` si no tiene foto. */
  fotoPerfil: string | null;
}

export class ObtenerFotoPerfilTrabajadorUseCase {
  constructor(
    private readonly trabajadorRepository: ITrabajadorRepository,
    private readonly minioStorage: MinioStoragePort,
  ) {}

  async execute(idTrabajador: number): Promise<FotoPerfilTrabajadorResult> {
    const row =
      await this.trabajadorRepository.obtenerUrlAlmacenadaFotoPerfilPorIdTrabajador(
        idTrabajador,
      );

    if (row === null) {
      throw new NotFoundError('Trabajador no encontrado');
    }

    if (!row.url?.trim()) {
      return { fotoPerfil: null };
    }

    const viewUrl = await this.minioStorage.resolveViewUrlForEvidenciaStoredUrl(
      row.url,
    );

    return { fotoPerfil: viewUrl };
  }
}
