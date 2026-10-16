import type { UploadedFile } from './uploaded-file';

/** Contrato de aplicación; la implementación y su configuración pertenecen a infraestructura. */
export interface SavedNovedadTarjetaMedia {
  url: string;
  nombreOriginal: string;
  tipoMime: string;
  tamanoBytes: number;
}

export abstract class NovedadTarjetaMediaStoragePort {
  abstract save(
    idLanzamiento: number,
    tipoMultimedia: 'imagen' | 'video',
    file: UploadedFile,
  ): Promise<SavedNovedadTarjetaMedia>;
  abstract deleteByStoredUrl(url: string): Promise<void>;
}
