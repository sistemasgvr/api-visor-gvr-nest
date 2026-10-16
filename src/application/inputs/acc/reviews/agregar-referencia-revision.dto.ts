export class AgregarReferenciaRevisionDto {
  /** Tipo de objeto: INCIDENCIA, FOTO, ARCHIVO, RFI, SUBMITTAL, etc. */

  tipoReferencia!: string;

  /** ID único del objeto en ACC (UUID issue) o GVR */

  idReferenciaExterna!: string;

  /** Origen: ACC | GVR | EXTERNAL (default: ACC) */

  dominioReferencia?: string;

  /** Versión del objeto al crear el vínculo (ej: V1, V3) */

  versionReferencia?: string;

  /** Notas del usuario sobre por qué se vinculó */

  notasReferencia?: string;

  /** Deep-link directo al objeto referenciado */

  urlDeepLink?: string;

  /** Snapshot de datos del objeto para display sin re-fetch */

  metadataJson?: Record<string, any>;
}
