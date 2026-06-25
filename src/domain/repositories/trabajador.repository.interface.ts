export interface ListarTrabajadoresParams {
  idUsuario: number;
  idEmpresa?: number;
  busqueda?: string;
  limit?: number;
  offset?: number;
  idRol?: number;
  estado?: number | null;
}

export interface ListarTrabajadoresResponse {
  data: any[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    total_pages: number;
    current_page: number;
  };
}

export interface CrearTrabajadorData {
  nombres: string;
  apellidos: string;
  idTipoDocumento: number;
  nroDocumento: string;
  correo: string;
  idEmpresa: number;
  idUsuarioCreacion: number;
  idResponsable?: number;
  idRol?: number;
  fechaNacimiento?: string;
  celular?: string;
  telefonoEmergencia?: string;
  contactoEmergenciaNombre?: string;
  idContactoEmergenciaParentesco?: number;
  direccionDomiciliaria?: string;
  observaciones?: string;
  idPais?: number;
  idDepartamento?: number;
  idProvincia?: number;
  idDistrito?: number;
  nroRuc?: string;
  idGradoInstruccion?: number;
  idCarrera?: number;
  idEntidadBancaria?: number;
  nroCuentaCorriente?: string;
  nroCci?: string;
  remuneracion?: number;
  idTipoContrato?: number;
  idDuracionContrato?: number;
  fechaInicioLabores?: string;
  fechaInicioContrato?: string;
  fechaFinContrato?: string;
  idModalidad?: number;
  idPuestoTrabajo?: number;
  adjuntos?: { idTipoAdjunto: number; ruta: string }[];
}

export interface ActualizarContratoTrabajadorData {
  idContrato: number;
  idTrabajador: number;
  idUsuarioModificacion: number;
  idTipoContrato?: number;
  idDuracionContrato?: number;
  fechaInicio?: string;
  fechaFin?: string;
  remuneracion?: number;
  fechaInicioLabores?: string;
  idPuestoTrabajo?: number | null;
}

export interface InsertarContratoTrabajadorData {
  idTrabajador: number;
  idUsuarioCreacion: number;
  idTipoContrato: number;
  idDuracionContrato?: number;
  fechaInicio?: string;
  fechaFin?: string;
  remuneracion?: number;
  fechaInicioLabores?: string;
  idPuestoTrabajo?: number | null;
}

export interface EliminarContratoTrabajadorData {
  idContrato: number;
  idTrabajador: number;
  idUsuarioModificacion: number;
}

export interface EditarTrabajadorData {
  idTrabajador: number;
  nombres: string;
  apellidos: string;
  idTipoDocumento: number;
  nroDocumento: string;
  correo: string;
  idEmpresa: number;
  idUsuarioModificacion: number;
  idResponsable?: number;
  idRol?: number;
  fechaNacimiento?: string;
  celular?: string;
  telefonoEmergencia?: string;
  contactoEmergenciaNombre?: string;
  idContactoEmergenciaParentesco?: number;
  direccionDomiciliaria?: string;
  observaciones?: string;
  idPais?: number;
  idDepartamento?: number;
  idProvincia?: number;
  idDistrito?: number;
  nroRuc?: string;
  idGradoInstruccion?: number;
  idCarrera?: number;
  idEntidadBancaria?: number;
  nroCuentaCorriente?: string;
  nroCci?: string;
  remuneracion?: number;
  idTipoContrato?: number;
  idDuracionContrato?: number;
  fechaInicioLabores?: string;
  fechaInicioContrato?: string;
  fechaFinContrato?: string;
  idModalidad?: number;
  idPuestoTrabajo?: number;
  adjuntos?: { idTipoAdjunto: number; ruta: string }[];
}

export interface ITrabajadorRepository {
  listarTrabajadores(
    params: ListarTrabajadoresParams,
  ): Promise<ListarTrabajadoresResponse>;
  listarTrabajadoresAdministrativos(): Promise<any[]>;
  obtenerTrabajadorPorId(idTrabajador: number): Promise<any>;

  /**
   * URL almacenada en BD (MinIO path / URL interna) de la foto de perfil del usuario
   * vinculado al trabajador. `null` externo = trabajador inexistente o inactivo.
   */
  obtenerUrlAlmacenadaFotoPerfilPorIdTrabajador(
    idTrabajador: number,
  ): Promise<{ url: string | null } | null>;

  obtenerIdTrabajadorActivoPorIdUsuario(
    idUsuario: number,
  ): Promise<number | null>;

  obtenerUrlAlmacenadaFirmaPorIdTrabajador(
    idTrabajador: number,
  ): Promise<{ url: string | null } | null>;

  actualizarFirmaTrabajador(
    idTrabajador: number,
    urlFirma: string,
    idUsuarioModificacion: number,
    nombreOriginal?: string | null,
    tipoMime?: string | null,
    tamanoBytes?: number | null,
  ): Promise<{ urlFirma: string }>;
  crearTrabajador(data: CrearTrabajadorData): Promise<any>;
  editarTrabajador(data: EditarTrabajadorData): Promise<any>;

  actualizarContratoTrabajador(data: ActualizarContratoTrabajadorData): Promise<any>;
  insertarContratoTrabajador(data: InsertarContratoTrabajadorData): Promise<any>;
  eliminarContratoTrabajador(data: EliminarContratoTrabajadorData): Promise<any>;
  eliminarTrabajador(
    idTrabajador: number,
    idUsuarioModificacion: number,
  ): Promise<any>;
  activarTrabajador(
    idTrabajador: number,
    idUsuarioModificacion: number,
  ): Promise<any>;
  resetearContrasena(
    idTrabajador: number,
    idUsuarioModificacion: number,
  ): Promise<any>;
  eliminarAdjuntosPorTrabajador(idTrabajador: number): Promise<void>;
  insertarAdjuntos(
    idTrabajador: number,
    adjuntos: { idTipoAdjunto: number; ruta: string }[],
    idUsuarioCreacion?: number,
  ): Promise<void>;
}

export const TRABAJADOR_REPOSITORY = 'TRABAJADOR_REPOSITORY';
