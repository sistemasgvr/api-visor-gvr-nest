export class VisorElementoFotoArchivoDto {
  url: string;

  nombreOriginal?: string;

  tipoMime?: string;

  tamanoBytes?: number;

  /** Fecha del avance (YYYY-MM-DD), puede ser distinta a la fecha de subida */

  fechaAvance?: string;
}

export class CrearVisorElementoFotoDto {
  documentUrn: string;

  itemId: string;

  versionId?: string;

  nombreDocumento?: string;

  objectId: number;

  externalId?: string;

  nombreElemento?: string;

  posicionX: number;

  posicionY: number;

  posicionZ: number;

  viewableGuid?: string;

  viewableName?: string;

  is3D?: boolean;

  viewerState?: Record<string, unknown>;

  idProyectoGvr?: number;

  titulo?: string;

  descripcion?: string;

  archivos: VisorElementoFotoArchivoDto[];
}

export class ActualizarVisorElementoFotoDto {
  titulo?: string;

  descripcion?: string;

  posicionX?: number;

  posicionY?: number;

  posicionZ?: number;

  nombreElemento?: string;
}

export class AgregarArchivosVisorElementoFotoDto {
  archivos: VisorElementoFotoArchivoDto[];
}
