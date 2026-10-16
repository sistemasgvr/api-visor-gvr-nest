import type { UploadedFile } from './uploaded-file';

/** Contrato de aplicación; la implementación y su configuración pertenecen a infraestructura. */
export interface SavedWorkerSignatureMeta {
  url: string;
  nombreOriginal: string;
  tipoMime: string;
  tamanoBytes: number;
}

export abstract class WorkerSignatureStoragePort {
  abstract save(
    trabajadorId: number,
    workerDisplayName: string,
    file: UploadedFile,
  ): Promise<SavedWorkerSignatureMeta>;
  abstract delete(relativePath: string): Promise<void>;
}
