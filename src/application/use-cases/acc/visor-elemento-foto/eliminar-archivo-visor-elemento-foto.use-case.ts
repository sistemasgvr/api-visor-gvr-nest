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
export class EliminarArchivoVisorElementoFotoUseCase {
  constructor(
    @Inject(ACC_VISOR_ELEMENTO_FOTO_REPOSITORY)
    private readonly repository: IAccVisorElementoFotoRepository,
    private readonly minioStorage: MinioStorageService,
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
      throw new NotFoundException('Imagen no encontrada o ya eliminada');
    }
    await this.minioStorage.tryDeleteEvidenciaStoredObject(url);
  }
}
