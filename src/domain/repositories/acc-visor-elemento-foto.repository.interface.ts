export const ACC_VISOR_ELEMENTO_FOTO_REPOSITORY = Symbol(
  'ACC_VISOR_ELEMENTO_FOTO_REPOSITORY',
);

export const MAX_VISOR_ELEMENTO_FOTO_ARCHIVOS = 10;

export interface VisorElementoFotoArchivoEntrada {
  url: string;
  nombreOriginal?: string | null;
  tipoMime?: string | null;
  tamanoBytes?: number | null;
}

export interface CrearVisorElementoFotoParams {
  idProyectoAcc: string;
  idProyectoGvr?: number | null;
  documentUrn: string;
  itemId: string;
  versionId?: string | null;
  nombreDocumento?: string | null;
  objectId: number;
  externalId?: string | null;
  nombreElemento?: string | null;
  posicionX: number;
  posicionY: number;
  posicionZ: number;
  viewableGuid?: string | null;
  viewableName?: string | null;
  is3D?: boolean;
  viewerState?: Record<string, unknown> | null;
  titulo?: string | null;
  descripcion?: string | null;
  archivos: VisorElementoFotoArchivoEntrada[];
  idUsuario: number;
}

export interface ActualizarVisorElementoFotoParams {
  id: number;
  titulo?: string | null;
  descripcion?: string | null;
  posicionX?: number | null;
  posicionY?: number | null;
  posicionZ?: number | null;
  nombreElemento?: string | null;
  idUsuario: number;
}

export interface AgregarArchivosVisorElementoFotoParams {
  idVisorElementoFoto: number;
  archivos: VisorElementoFotoArchivoEntrada[];
  idUsuario: number;
}

export interface VisorElementoFotoListItem {
  id: number;
  idProyectoAcc: string;
  documentUrn: string;
  itemId: string;
  objectId: number;
  externalId: string | null;
  nombreElemento: string | null;
  posicionX: number;
  posicionY: number;
  posicionZ: number;
  viewableGuid: string | null;
  viewableName: string | null;
  is3D: boolean;
  titulo: string | null;
  descripcion: string | null;
  cantidadArchivos: number;
  urlPreview: string | null;
  urlPreviewView?: string | null;
  fechaModificacion: string | null;
}

export interface VisorElementoFotoArchivoItem {
  idArchivoJunction: number;
  idArchivo: number;
  urlArchivo: string;
  viewUrl?: string;
  nombreOriginal: string | null;
  tipoMime: string | null;
  tamanoBytes: number | null;
  ordenArchivo: number;
}

export interface VisorElementoFotoDetalle {
  id: number;
  idProyectoAcc: string;
  idProyectoGvr: number | null;
  documentUrn: string;
  itemId: string;
  versionId: string | null;
  nombreDocumento: string | null;
  objectId: number;
  externalId: string | null;
  nombreElemento: string | null;
  posicionX: number;
  posicionY: number;
  posicionZ: number;
  viewableGuid: string | null;
  viewableName: string | null;
  is3D: boolean;
  viewerState: Record<string, unknown> | null;
  titulo: string | null;
  descripcion: string | null;
  cantidadArchivos: number;
  fechaCreacion: string | null;
  fechaModificacion: string | null;
  archivos: VisorElementoFotoArchivoItem[];
}

export interface CrearVisorElementoFotoResult {
  success: boolean;
  message: string;
  id: number | null;
}

export interface IAccVisorElementoFotoRepository {
  crear(params: CrearVisorElementoFotoParams): Promise<CrearVisorElementoFotoResult>;
  actualizar(params: ActualizarVisorElementoFotoParams): Promise<void>;
  agregarArchivos(params: AgregarArchivosVisorElementoFotoParams): Promise<number>;
  listarPorDocumento(
    idProyectoAcc: string,
    documentUrn: string,
    viewableGuid?: string | null,
  ): Promise<VisorElementoFotoListItem[]>;
  obtenerPorElemento(
    idProyectoAcc: string,
    documentUrn: string,
    viewableGuid: string | null | undefined,
    objectId: number,
  ): Promise<VisorElementoFotoDetalle | null>;
  obtenerPorId(id: number): Promise<VisorElementoFotoDetalle | null>;
  eliminarArchivo(
    idVisorElementoFoto: number,
    idArchivoJunction: number,
    idUsuario: number,
  ): Promise<string | null>;
  eliminar(id: number, idUsuario: number): Promise<void>;
}
