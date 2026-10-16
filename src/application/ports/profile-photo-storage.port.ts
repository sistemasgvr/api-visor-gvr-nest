import type { UploadedFile } from './uploaded-file';

/** Contrato de aplicación; la implementación y su configuración pertenecen a infraestructura. */
export interface SavedProfilePhotoMeta {
  url: string;
  nombreOriginal: string;
  tipoMime: string;
  tamanoBytes: number;
}

export abstract class ProfilePhotoStoragePort {
  abstract save(
    userId: number,
    userDisplayName: string,
    file: UploadedFile,
  ): Promise<SavedProfilePhotoMeta>;
  abstract delete(relativePath: string): Promise<void>;
}
