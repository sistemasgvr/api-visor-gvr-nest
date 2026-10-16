export class CrearVisorMarcaRevisionDto {
  documentUrn: string;

  itemId: string;

  tipoMarca: string;

  markupPayload: Record<string, unknown>;

  versionId?: string;

  nombreDocumento?: string;

  viewableGuid?: string;

  viewableName?: string;

  paginaNumero?: number;

  is3D?: boolean;

  viewerState?: Record<string, unknown>;

  idProyectoGvr?: number;

  idRevisionArchivo?: number;

  titulo?: string;

  markupIdAps?: string;

  layerName?: string;

  estilos?: Record<string, unknown>;

  boundingBox?: Record<string, unknown>;

  miniaturaSvg?: string;
}

export class ActualizarVisorMarcaRevisionDto {
  titulo?: string;

  markupPayload?: Record<string, unknown>;

  markupIdAps?: string;

  estilos?: Record<string, unknown>;

  boundingBox?: Record<string, unknown>;

  miniaturaSvg?: string;

  viewerState?: Record<string, unknown>;

  viewableGuid?: string;

  viewableName?: string;

  paginaNumero?: number;
}

export class DuplicarVisorMarcaRevisionDto {
  desplazamiento?: Record<string, unknown>;

  titulo?: string;
}

export class SincronizarMarkupIdApsDto {
  markupIdAps: string;
}
