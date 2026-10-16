import type { IAuthRepository } from '../../../domain/repositories/auth.repository.interface';
import {
  InternalError,
  UnauthenticatedError,
} from '../../errors/application.error';
import { MinioStoragePort } from '../../ports/minio-storage.port';
import { ProfilePhotoStoragePort } from '../../ports/profile-photo-storage.port';
import { TokenServicePort } from '../../ports/runtime.port';
import type { UploadedFile } from '../../ports/uploaded-file';

export class SubirFotoPerfilUseCase {
  constructor(
    private readonly authRepository: IAuthRepository,
    private readonly jwtService: TokenServicePort,
    private readonly profilePhotoStorageService: ProfilePhotoStoragePort,
    private readonly minioStorage: MinioStoragePort,
  ) {}

  async execute(
    token: string,
    file: UploadedFile,
  ): Promise<{ fotoPerfil: string }> {
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
    const userDisplayName = payload.nombre?.trim() || `usuario-${userId}`;

    // Guardar archivo primero
    const saved = await this.profilePhotoStorageService.save(
      userId,
      userDisplayName,
      file,
    );

    // Intentar actualizar en BD; si falla, eliminar el archivo subido
    try {
      const { fotoPerfil } = await this.authRepository.actualizarFotoPerfil(
        userId,
        saved.url,
        saved.nombreOriginal,
        saved.tipoMime,
        saved.tamanoBytes,
      );
      let view = fotoPerfil;
      if (fotoPerfil?.trim()) {
        view =
          await this.minioStorage.resolveViewUrlForEvidenciaStoredUrl(
            fotoPerfil,
          );
      }
      return { fotoPerfil: view };
    } catch (error) {
      // Rollback: eliminar archivo si la BD falla
      await this.profilePhotoStorageService.delete(saved.url);
      throw new InternalError(
        'No se pudo actualizar la foto de perfil en la base de datos',
      );
    }
  }
}
