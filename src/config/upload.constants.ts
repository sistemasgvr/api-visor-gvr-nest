/** Timeout HTTP al subir el binario a la URL firmada S3 de Autodesk (ms). 0 = sin límite en axios. */
export const UPLOAD_S3_HTTP_TIMEOUT_MS = 60 * 60 * 1000; // 1 hora

/** Tamaño máximo multipart en DOCS (bytes). Por defecto 5 GB; configurable con UPLOAD_MAX_FILE_SIZE_MB. */
export function getUploadMaxFileSizeBytes(): number {
  const mb = parseInt(process.env.UPLOAD_MAX_FILE_SIZE_MB ?? '5120', 10);
  if (!Number.isFinite(mb) || mb < 1) return 5 * 1024 * 1024 * 1024;
  return mb * 1024 * 1024;
}

/** Tamaño de chunk por defecto para subida por partes (10 MB). */
export const DOCS_CHUNK_SIZE_BYTES = 10 * 1024 * 1024;

/** Máximo de URLs firmadas por lote para APS Direct-to-S3. */
export const DOCS_CHUNK_SIGNED_URL_BATCH = 25;
