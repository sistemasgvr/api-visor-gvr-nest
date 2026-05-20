import { MinioStorageService } from '../../../infrastructure/storage/minio-storage.service';

async function resolveArchivoUrl(
  minio: MinioStorageService,
  url: string | null | undefined,
): Promise<string | null | undefined> {
  const raw = url?.trim();
  if (!raw) return url;
  try {
    return await minio.resolveViewUrlForEvidenciaStoredUrl(raw);
  } catch {
    return raw;
  }
}

export async function enrichNovedadTarjetasMediaUrls(
  data: { tarjetas?: Array<{ archivo?: { url?: string } | null }> } | null,
  minio: MinioStorageService,
): Promise<void> {
  if (!data?.tarjetas?.length) return;
  for (const tarjeta of data.tarjetas) {
    if (tarjeta.archivo?.url) {
      tarjeta.archivo.url =
        (await resolveArchivoUrl(minio, tarjeta.archivo.url)) ??
        tarjeta.archivo.url;
    }
  }
}

export async function enrichNovedadLanzamientosListMediaUrls(
  lanzamientos: Array<{ tarjetas?: Array<{ archivo?: { url?: string } | null }> }>,
  minio: MinioStorageService,
): Promise<void> {
  for (const l of lanzamientos) {
    await enrichNovedadTarjetasMediaUrls(l, minio);
  }
}
