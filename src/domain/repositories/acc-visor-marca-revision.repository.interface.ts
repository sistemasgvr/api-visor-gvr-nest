export const ACC_VISOR_MARCA_REVISION_REPOSITORY = Symbol(
  'ACC_VISOR_MARCA_REVISION_REPOSITORY',
);

export interface CrearVisorMarcaRevisionParams {
  idProyectoAcc: string;
  documentUrn: string;
  itemId: string;
  tipoMarca: string;
  markupPayload: Record<string, unknown>;
  idProyectoGvr?: number | null;
  versionId?: string | null;
  nombreDocumento?: string | null;
  viewableGuid?: string | null;
  viewableName?: string | null;
  paginaNumero?: number | null;
  is3D?: boolean;
  viewerState?: Record<string, unknown> | null;
  idRevisionArchivo?: number | null;
  titulo?: string | null;
  markupIdAps?: string | null;
  layerName?: string | null;
  estilos?: Record<string, unknown> | null;
  boundingBox?: Record<string, unknown> | null;
  miniaturaSvg?: string | null;
  idUsuario: number;
}

export interface ActualizarVisorMarcaRevisionParams {
  id: number;
  idUsuario: number;
  titulo?: string | null;
  markupPayload?: Record<string, unknown> | null;
  markupIdAps?: string | null;
  estilos?: Record<string, unknown> | null;
  boundingBox?: Record<string, unknown> | null;
  miniaturaSvg?: string | null;
  viewerState?: Record<string, unknown> | null;
  viewableGuid?: string | null;
  viewableName?: string | null;
  paginaNumero?: number | null;
}

export interface DuplicarVisorMarcaRevisionParams {
  idMarcaOrigen: number;
  idUsuario: number;
  desplazamiento?: Record<string, unknown> | null;
  titulo?: string | null;
}

export interface ListarVisorMarcasRevisionParams {
  idProyectoAcc: string;
  documentUrn: string;
  idUsuario: number;
  viewableGuid?: string | null;
  paginaNumero?: number | null;
  versionId?: string | null;
  idRevisionArchivo?: number | null;
  soloPublicadas?: boolean | null;
  soloPropias?: boolean | null;
}

export interface ContarVisorMarcasRevisionParams {
  idProyectoAcc: string;
  documentUrn: string;
  idUsuario: number;
  viewableGuid?: string | null;
  paginaNumero?: number | null;
  versionId?: string | null;
}

export interface VisorMarcaRevisionItem {
  id: number;
  idProyectoAcc: string;
  idProyectoGvr: number | null;
  documentUrn: string;
  itemId: string;
  versionId: string | null;
  nombreDocumento: string | null;
  viewableGuid: string | null;
  viewableName: string | null;
  paginaNumero: number | null;
  is3D: boolean;
  idRevisionArchivo: number | null;
  tipoMarca: string;
  titulo: string | null;
  markupIdAps: string | null;
  layerName: string;
  markupPayload: Record<string, unknown>;
  estilos: Record<string, unknown> | null;
  boundingBox: Record<string, unknown> | null;
  miniaturaSvg: string | null;
  publicado: boolean;
  fechaPublicacion: string | null;
  idMarcaOrigen: number | null;
  idUsuarioCreacion: number | null;
  nombreUsuarioCreacion: string | null;
  esPropia: boolean;
  puedeEditar: boolean;
  fechaCreacion: string | null;
  fechaModificacion: string | null;
}

export interface VisorMarcaRevisionDetalle extends VisorMarcaRevisionItem {
  viewerState: Record<string, unknown> | null;
  idUsuarioPublicacion: number | null;
}

export interface CrearVisorMarcaRevisionResult {
  success: boolean;
  message: string;
  id: number | null;
}

export interface DuplicarVisorMarcaRevisionResult {
  success: boolean;
  message: string;
  id: number | null;
}

export interface OperacionVisorMarcaRevisionResult {
  success: boolean;
  message: string;
}

export interface ContarVisorMarcasRevisionResult {
  totalVisibles: number;
  totalPublicadas: number;
  totalPropias: number;
  totalPropiasPrivadas: number;
}

export interface IAccVisorMarcaRevisionRepository {
  crear(params: CrearVisorMarcaRevisionParams): Promise<CrearVisorMarcaRevisionResult>;
  actualizar(params: ActualizarVisorMarcaRevisionParams): Promise<OperacionVisorMarcaRevisionResult>;
  duplicar(params: DuplicarVisorMarcaRevisionParams): Promise<DuplicarVisorMarcaRevisionResult>;
  publicar(id: number, idUsuario: number): Promise<OperacionVisorMarcaRevisionResult>;
  anularPublicacion(id: number, idUsuario: number): Promise<OperacionVisorMarcaRevisionResult>;
  suprimir(id: number, idUsuario: number): Promise<OperacionVisorMarcaRevisionResult>;
  listar(params: ListarVisorMarcasRevisionParams): Promise<VisorMarcaRevisionItem[]>;
  contar(params: ContarVisorMarcasRevisionParams): Promise<ContarVisorMarcasRevisionResult>;
  obtenerPorId(id: number, idUsuario?: number | null): Promise<VisorMarcaRevisionDetalle | null>;
  sincronizarMarkupIdAps(
    id: number,
    idUsuario: number,
    markupIdAps: string,
  ): Promise<OperacionVisorMarcaRevisionResult>;
}
