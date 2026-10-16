import type { UploadedFile } from './uploaded-file';

/** Contrato de aplicación; la implementación y su configuración pertenecen a infraestructura. */
export interface PreparedAccProjectImage {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
  size: number;
}

export abstract class SharpAccProjectImagePreparerPort {
  abstract prepareForAcc(
    file: UploadedFile,
    targetMaxBytes: number,
  ): Promise<PreparedAccProjectImage>;
}
