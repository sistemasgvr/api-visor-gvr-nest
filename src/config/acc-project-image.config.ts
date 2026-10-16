/**
 * Tamaño máximo del archivo enviado a Autodesk HQ (tras comprimir con Sharp).
 * En la práctica el gateway suele rechazar payloads ~1 MB+; el valor por defecto deja margen.
 * Ajustable con ACC_PROJECT_IMAGE_MAX_BYTES (bytes, entero positivo).
 */
export function getAccProjectImageMaxBytes(): number {
  const raw = process.env.ACC_PROJECT_IMAGE_MAX_BYTES;
  if (raw != null && raw !== '') {
    const n = Number(raw);
    if (Number.isFinite(n) && n > 0) {
      return Math.floor(n);
    }
  }
  return 900 * 1024;
}

/**
 * Tamaño máximo del multipart que acepta este API antes de comprimir (Multer).
 * Ajustable con ACC_PROJECT_IMAGE_UPLOAD_MAX_BYTES.
 */
export function getAccProjectImageUploadMaxBytes(): number {
  const raw = process.env.ACC_PROJECT_IMAGE_UPLOAD_MAX_BYTES;
  if (raw != null && raw !== '') {
    const n = Number(raw);
    if (Number.isFinite(n) && n > 0) {
      return Math.floor(n);
    }
  }
  return 15 * 1024 * 1024;
}

export function getAccProjectImageMaxLabel(): string {
  const bytes = getAccProjectImageMaxBytes();
  if (bytes >= 1024 * 1024) {
    const mb = bytes / (1024 * 1024);
    return Number.isInteger(mb) ? `${mb} MB` : `${mb.toFixed(1)} MB`;
  }
  if (bytes % 1024 === 0) {
    return `${bytes / 1024} KB`;
  }
  return `${Math.round(bytes / 1024)} KB`;
}
