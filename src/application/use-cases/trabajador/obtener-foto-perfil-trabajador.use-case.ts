import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { ITrabajadorRepository } from '../../../domain/repositories/trabajador.repository.interface';
import { TRABAJADOR_REPOSITORY } from '../../../domain/repositories/trabajador.repository.interface';
import { MinioStorageService } from '../../../infrastructure/storage/minio-storage.service';

export interface FotoPerfilTrabajadorResult {
  /** URL lista para mostrar (firmada / pública según MinIO). `null` si no tiene foto. */
  fotoPerfil: string | null;
}

@Injectable()
export class ObtenerFotoPerfilTrabajadorUseCase {
  constructor(
    @Inject(TRABAJADOR_REPOSITORY)
    private readonly trabajadorRepository: ITrabajadorRepository,
    private readonly minioStorage: MinioStorageService,
  ) {}

  async execute(idTrabajador: number): Promise<FotoPerfilTrabajadorResult> {
    const row =
      await this.trabajadorRepository.obtenerUrlAlmacenadaFotoPerfilPorIdTrabajador(
        idTrabajador,
      );

    if (row === null) {
      throw new NotFoundException('Trabajador no encontrado');
    }

    if (!row.url?.trim()) {
      return { fotoPerfil: null };
    }

    const viewUrl =
      await this.minioStorage.resolveViewUrlForEvidenciaStoredUrl(row.url);

    return { fotoPerfil: viewUrl };
  }
}
