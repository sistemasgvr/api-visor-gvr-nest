import { type IAccVisorElementoFotoRepository } from '../../../../domain/repositories/acc-visor-elemento-foto.repository.interface';
import { NotFoundError } from '../../../errors/application.error';
import { MinioStoragePort } from '../../../ports/minio-storage.port';

export class EliminarVisorElementoFotoUseCase {
  constructor(
    private readonly repository: IAccVisorElementoFotoRepository,
    private readonly minioStorage: MinioStoragePort,
  ) {}

  async execute(id: number, idUsuario: number): Promise<void> {
    const existing = await this.repository.obtenerPorId(id);
    if (!existing) {
      throw new NotFoundError('Anclaje de fotos no encontrado');
    }
    const urls = existing.archivos.map((a) => a.urlArchivo).filter(Boolean);
    await this.repository.eliminar(id, idUsuario);
    for (const url of urls) {
      await this.minioStorage.tryDeleteEvidenciaStoredObject(url);
    }
  }
}
