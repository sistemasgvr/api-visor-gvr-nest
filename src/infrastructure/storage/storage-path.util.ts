/**
 * Segmentos seguros para rutas tipo S3/MinIO (solo ASCII, sin traversal).
 * @see https://min.io/docs/minio/linux/developers/javascript/minio-javascript.html
 */
export function slugifyPathSegment(
  input: string,
  maxLength = 80,
): string {
  const base = (input ?? '')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, maxLength);
  return base.length > 0 ? base : 'sin-nombre';
}

/** Nombre de archivo local seguro (sin rutas). */
export function sanitizeFilename(originalName: string, maxBase = 120): string {
  const name = (originalName ?? 'archivo').split(/[/\\]/).pop() ?? 'archivo';
  const cleaned = name.replace(/[^a-zA-Z0-9._-]+/g, '_').slice(0, maxBase);
  return cleaned.length > 0 ? cleaned : 'archivo';
}

/**
 * evidencias-actividades/usuarios/{user_id}-{nombre}/{actividad_id}-{actividad_slug}/{archivo}
 */
export function buildEvidenciaObjectKey(params: {
  userId: number;
  userDisplayName: string;
  actividadId: number;
  actividadSlug: string;
  filename: string;
}): string {
  const userSeg = `${params.userId}-${slugifyPathSegment(params.userDisplayName, 60)}`;
  const actSeg = `${params.actividadId}-${slugifyPathSegment(params.actividadSlug, 80)}`;
  const file = sanitizeFilename(params.filename);
  return `evidencias-actividades/usuarios/${userSeg}/${actSeg}/${file}`;
}
