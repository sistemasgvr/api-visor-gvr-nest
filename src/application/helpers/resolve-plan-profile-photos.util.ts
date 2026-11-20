import type { MinioStoragePort } from '../ports/minio-storage.port';

/** La BD conserva la ruta del archivo; la respuesta entrega la URL de lectura. */
export function resolvePlanProfilePhotos<T extends { foto: string | null }>(
  personas: T[],
  storage: MinioStoragePort,
): Promise<T[]> {
  return Promise.all(
    personas.map(async (persona) => ({
      ...persona,
      foto: persona.foto?.trim()
        ? await storage.resolveViewUrlForEvidenciaStoredUrl(persona.foto)
        : null,
    })),
  );
}
