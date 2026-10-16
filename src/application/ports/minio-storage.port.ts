import type { UploadedFile } from './uploaded-file';

/** Contrato de aplicación; la implementación y su configuración pertenecen a infraestructura. */
export interface UploadedObjectMeta {
  bucket: string;
  key: string;
  /** URL pública si `MINIO_PUBLIC_BASE_URL` o el endpoint permiten lectura anónima. */
  publicUrl: string;
  contentType: string;
  size: number;
}

export abstract class MinioStoragePort {
  abstract refreshFromConfig(): void;
  abstract isConfigured(): boolean;
  abstract getBucketName(): string | null;
  abstract resolveViewUrlForEvidenciaStoredUrl(
    stored: string,
    expiresInSeconds?: unknown,
  ): Promise<string>;
  abstract tryDeleteEvidenciaStoredObject(stored: string): Promise<void>;
  abstract ensureBucket(): Promise<void>;
  abstract buildPublicUrl(bucket: string, key: string): string;
  abstract putObject(params: {
    key: string;
    body: Buffer;
    contentType?: string;
    cacheControl?: string;
  }): Promise<UploadedObjectMeta>;
  abstract uploadEvidenciaUsuarioActividad(params: {
    userId: number;
    userDisplayName: string;
    actividadId: number;
    /** Fecha de la jornada/actividad (YYYY-MM-DD) para la jerarquía por día en MinIO. */
    diaActividad: string;
    file: UploadedFile;
    /** Orden 1..n de la evidencia; si se envía, nombres alineados con genArchivo (Modulo Actividades). */
    indiceEvidencia?: number;
  }): Promise<UploadedObjectMeta>;
  abstract uploadVisorElementoFoto(params: {
    idProyectoAcc: string;
    itemId: string;
    /** id del anclaje en BD, o objectId Forge antes de crear el anclaje */
    identificador: number;
    dia: string;
    file: UploadedFile;
    indiceFoto?: number;
  }): Promise<UploadedObjectMeta>;
  abstract uploadUnderPrefix(params: {
    prefix: string;
    file: UploadedFile;
    /** Si no se envía, se usa el nombre sanitizado del archivo. */
    filename?: string;
  }): Promise<UploadedObjectMeta>;
  abstract deleteObject(key: string): Promise<void>;
  abstract getPresignedGetUrl(
    key: string,
    expiresInSeconds?: unknown,
  ): Promise<string>;
}
