import type { ITrabajadorRepository } from '../../../domain/repositories/trabajador.repository.interface';
import {
  InternalError,
  InvalidInputError,
  UnauthenticatedError,
} from '../../errors/application.error';
import { MinioStoragePort } from '../../ports/minio-storage.port';
import { TokenServicePort } from '../../ports/runtime.port';
import type { UploadedFile } from '../../ports/uploaded-file';
import { WorkerSignatureStoragePort } from '../../ports/worker-signature-storage.port';

export class SubirFirmaTrabajadorUseCase {
  constructor(
    private readonly trabajadorRepository: ITrabajadorRepository,
    private readonly jwtService: TokenServicePort,
    private readonly workerSignatureStorageService: WorkerSignatureStoragePort,
    private readonly minioStorage: MinioStoragePort,
  ) {}

  async execute(
    token: string,
    file: UploadedFile,
  ): Promise<{ urlFirma: string }> {
    let payload: { sub?: number; nombre?: string };
    try {
      payload = await this.jwtService.verifyAsync(token);
    } catch {
      throw new UnauthenticatedError('Token inválido o expirado');
    }

    const userId = payload.sub;
    if (!userId) {
      throw new UnauthenticatedError('Token inválido');
    }

    const idTrabajador =
      await this.trabajadorRepository.obtenerIdTrabajadorActivoPorIdUsuario(
        userId,
      );
    if (!idTrabajador) {
      throw new InvalidInputError(
        'No tiene un trabajador activo vinculado a su cuenta. Contacte a administración.',
      );
    }

    const workerDisplayName =
      payload.nombre?.trim() || `trabajador-${idTrabajador}`;

    const saved = await this.workerSignatureStorageService.save(
      idTrabajador,
      workerDisplayName,
      file,
    );

    try {
      const { urlFirma } =
        await this.trabajadorRepository.actualizarFirmaTrabajador(
          idTrabajador,
          saved.url,
          userId,
          saved.nombreOriginal,
          saved.tipoMime,
          saved.tamanoBytes,
        );
      let view = urlFirma;
      if (urlFirma?.trim()) {
        view =
          await this.minioStorage.resolveViewUrlForEvidenciaStoredUrl(urlFirma);
      }
      return { urlFirma: view };
    } catch (error) {
      await this.workerSignatureStorageService.delete(saved.url);
      throw new InternalError(
        'No se pudo actualizar la firma en la base de datos',
      );
    }
  }
}
