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

/** `YYYY-MM-DD` → un solo segmento de carpeta `2026-04-27` (no `año/mes/día` anidado). Inválido → `sin-fecha`. */
export function yyyymmddToCarpetaFecha(yyyyMmDd: string): string {
  const t = (yyyyMmDd ?? '').trim().split('T')[0] ?? '';
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(t);
  if (!m) return 'sin-fecha';
  return `${m[1]}-${m[2]}-${m[3]}`;
}

/**
 * evidencias-actividades-gvr/{id-slug-usuario}/2026-04-27/{objectName}
 * Organización por fecha: una sola “carpeta” por día. El id de actividad inicia el nombre del archivo.
 */
export function buildEvidenciaObjectKey(params: {
  userId: number;
  userDisplayName: string;
  diaActividad: string;
  objectName: string;
}): string {
  const userSeg = `${params.userId}-${slugifyPathSegment(params.userDisplayName, 60)}`;
  const dateSeg = yyyymmddToCarpetaFecha(params.diaActividad);
  const name = params.objectName
    .replace(/[/\\]/g, '')
    .replace(/\.\.+/g, '.');
  return `evidencias-actividades-gvr/${userSeg}/${dateSeg}/${name}`;
}

/**
 * A partir de la URL almacenada en genArchivo (pública, relativa o absoluta) obtiene
 * la clave del objeto S3/MinIO dentro del bucket configurado.
 */
export function objectKeyFromStoredFileUrl(
  stored: string,
  bucket: string | null | undefined,
): string | null {
  const s = (stored ?? '').trim();
  if (!s) return null;
  if (/^https?:\/\//i.test(s)) {
    try {
      const u = new URL(s);
      let path = u.pathname.replace(/^\/+/, '');
      if (bucket && path.startsWith(`${bucket}/`)) {
        path = path.slice(bucket.length + 1);
      } else {
        const slash = path.indexOf('/');
        if (slash > 0 && bucket) {
          const first = path.slice(0, slash);
          if (first === bucket) {
            path = path.slice(slash + 1);
          }
        }
      }
      return path
        ? path
            .split('/')
            .map((p) => {
              try {
                return decodeURIComponent(p);
              } catch {
                return p;
              }
            })
            .join('/')
        : null;
    } catch {
      return null;
    }
  }
  return s.replace(/^\/+/, '') || null;
}

/** Suficiente para decidir presign/DELETE en nuestro bucket (no URLs externas). */
export function isEvidenciaMinioObjectKey(key: string): boolean {
  const k = (key ?? '').trim();
  return (
    k.startsWith('evidencias-actividades-gvr/') ||
    k.startsWith('evidencias-actividades/')
  );
}
