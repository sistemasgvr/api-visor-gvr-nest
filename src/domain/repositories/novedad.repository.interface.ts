export interface ListarNovedadLanzamientosParams {
  busqueda?: string;
  soloActivos?: boolean;
  limit?: number;
  offset?: number;
}

export interface ListarNovedadLanzamientosResponse {
  data: any[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    total_pages: number;
    current_page: number;
  };
}

export interface CrearNovedadLanzamientoData {
  titulo: string;
  fechaPublicacion?: Date | string | null;
  fechaVigenciaHasta?: Date | string | null;
  textoBotonCerrar?: string;
  idUsuarioCreacion: number;
}

export interface EditarNovedadLanzamientoData {
  id: number;
  titulo: string;
  fechaPublicacion?: Date | string | null;
  fechaVigenciaHasta?: Date | string | null;
  textoBotonCerrar?: string | null;
  idUsuarioModificacion: number;
}

export interface SincronizarRolesNovedadData {
  idNovedadLanzamiento: number;
  roles: number[];
  idUsuarioModificacion: number;
}

export interface RegistrarArchivoData {
  url: string;
  nombreOriginal?: string | null;
  tipoMime?: string | null;
  tamanoBytes?: number | null;
  idUsuarioCreacion: number;
}

export interface CrearNovedadTarjetaData {
  idNovedadLanzamiento: number;
  titulo: string;
  descripcion?: string | null;
  orden?: number;
  tipoMultimedia?: string;
  idArchivo?: number | null;
  urlMultimedia?: string | null;
  idUsuarioCreacion: number;
}

export interface EditarNovedadTarjetaData {
  id: number;
  titulo: string;
  descripcion?: string | null;
  orden?: number | null;
  tipoMultimedia?: string | null;
  idArchivo?: number | null;
  urlMultimedia?: string | null;
  limpiarMultimedia?: boolean;
  idUsuarioModificacion: number;
}

export interface INovedadRepository {
  listarLanzamientos(
    params: ListarNovedadLanzamientosParams,
  ): Promise<ListarNovedadLanzamientosResponse>;
  obtenerLanzamiento(id: number): Promise<any>;
  crearLanzamiento(data: CrearNovedadLanzamientoData): Promise<any>;
  editarLanzamiento(data: EditarNovedadLanzamientoData): Promise<any>;
  eliminarLanzamiento(
    id: number,
    idUsuarioModificacion: number,
  ): Promise<any>;
  sincronizarRoles(data: SincronizarRolesNovedadData): Promise<any>;
  registrarArchivo(data: RegistrarArchivoData): Promise<any>;
  obtenerIdLanzamientoPorTarjeta(idTarjeta: number): Promise<number | null>;
  /** URL persistida en genArchivo (MinIO) de la tarjeta activa, si existe. */
  obtenerArchivoUrlPorTarjeta(idTarjeta: number): Promise<string | null>;
  crearTarjeta(data: CrearNovedadTarjetaData): Promise<any>;
  editarTarjeta(data: EditarNovedadTarjetaData): Promise<any>;
  eliminarTarjeta(id: number, idUsuarioModificacion: number): Promise<any>;
  obtenerPendientesUsuario(idUsuario: number): Promise<any>;
  marcarVista(
    idUsuario: number,
    idNovedadLanzamiento: number,
    idUsuarioAuditoria?: number,
  ): Promise<any>;
}

export const NOVEDAD_REPOSITORY = 'NOVEDAD_REPOSITORY';
