import {
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ACC_VISOR_ELEMENTO_FOTO_REPOSITORY,
  type IAccVisorElementoFotoRepository,
} from '../../../../domain/repositories/acc-visor-elemento-foto.repository.interface';
import { MinioStorageService } from '../../../../infrastructure/storage/minio-storage.service';

@Injectable()
export class EliminarVisorElementoFotoUseCase {
  constructor(
    @Inject(ACC_VISOR_ELEMENTO_FOTO_REPOSITORY)
    private readonly repository: IAccVisorElementoFotoRepository,
    private readonly minioStorage: MinioStorageService,
  ) {}

  async execute(id: number, idUsuario: number): Promise<void> {
    const existing = await this.repository.obtenerPorId(id);
    if (!existing) {
      throw new NotFoundException('Anclaje de fotos no encontrado');
    }
    const urls = existing.archivos.map((a) => a.urlArchivo).filter(Boolean);
    await this.repository.eliminar(id, idUsuario);
    for (const url of urls) {
      await this.minioStorage.tryDeleteEvidenciaStoredObject(url);
    }
  }
}
