import { type IAccVisorElementoFotoRepository } from '../../../../domain/repositories/acc-visor-elemento-foto.repository.interface';
import { NotFoundError } from '../../../errors/application.error';
import { MinioStoragePort } from '../../../ports/minio-storage.port';

export class EliminarArchivoVisorElementoFotoUseCase {
  constructor(
    private readonly repository: IAccVisorElementoFotoRepository,
    private readonly minioStorage: MinioStoragePort,
  ) {}

  async execute(
    idVisorElementoFoto: number,
    idArchivoJunction: number,
    idUsuario: number,
  ): Promise<void> {
    const url = await this.repository.eliminarArchivo(
      idVisorElementoFoto,
      idArchivoJunction,
      idUsuario,
    );
    if (url == null) {
      throw new NotFoundError('Imagen no encontrada o ya eliminada');
    }
    await this.minioStorage.tryDeleteEvidenciaStoredObject(url);
  }
}
