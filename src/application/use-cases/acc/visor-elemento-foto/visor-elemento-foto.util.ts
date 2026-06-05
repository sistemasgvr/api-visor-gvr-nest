import type { VisorElementoFotoArchivoEntrada } from '../../../../domain/repositories/acc-visor-elemento-foto.repository.interface';
import { MAX_VISOR_ELEMENTO_FOTO_ARCHIVOS } from '../../../../domain/repositories/acc-visor-elemento-foto.repository.interface';

export function normalizarArchivosVisorElementoFoto(
  archivos: VisorElementoFotoArchivoEntrada[] | undefined,
  max = MAX_VISOR_ELEMENTO_FOTO_ARCHIVOS,
): VisorElementoFotoArchivoEntrada[] {
  const seen = new Map<string, VisorElementoFotoArchivoEntrada>();
  for (const a of archivos ?? []) {
    const u = a?.url != null ? String(a.url).trim() : '';
    if (!u || seen.has(u)) continue;
    const tb = a.tamanoBytes;
    seen.set(u, {
      url: u,
      nombreOriginal: a.nombreOriginal?.trim() || null,
      tipoMime: a.tipoMime?.trim() || null,
      tamanoBytes:
        tb != null && Number.isFinite(tb)
          ? Math.min(Math.trunc(tb as number), Number.MAX_SAFE_INTEGER)
          : null,
    });
  }
  return [...seen.values()].slice(0, max);
}
