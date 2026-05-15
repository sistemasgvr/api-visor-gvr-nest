import { MinioStorageService } from '../../infrastructure/storage/minio-storage.service';

/**
 * Resuelve urlfirma dentro del objeto trabajador del perfil (MinIO → URL de vista).
 */
export async function resolveTrabajadorFirmaViewUrl(
  trabajador: unknown,
  minioStorage: MinioStorageService,
): Promise<void> {
  if (!trabajador || typeof trabajador !== 'object') {
    return;
  }
  const t = trabajador as Record<string, unknown>;
  const stored =
    t.urlfirma != null
      ? String(t.urlfirma)
      : t.urlFirma != null
        ? String(t.urlFirma)
        : '';
  if (!stored.trim()) {
    return;
  }
  const viewUrl =
    await minioStorage.resolveViewUrlForEvidenciaStoredUrl(stored);
  t.urlfirma = viewUrl;
  t.urlFirma = viewUrl;
}
