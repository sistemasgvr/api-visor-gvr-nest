export class ActividadEvidenciaInDto {
  url: string = '';

  nombreOriginal?: string;

  tipoMime?: string;

  tamanoBytes?: number;
}

export class AgregarEvidenciasActividadDto {
  /** Nuevo: metadatos por URL (nombre, mime, tamaño en genArchivo). */

  evidencias?: ActividadEvidenciaInDto[];

  /** Compat: solo URL (sin metadatos). */
  urls?: string[];
}
