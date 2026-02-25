export interface ListarProyectosParams {
    idUsuario: number;
    idTipoProyecto?: number;
    idPais?: number;
    busqueda?: string;
    limit?: number;
    offset?: number;
}

export interface ListarProyectosResponse {
    data: any[];
    pagination: {
        total: number;
        limit: number;
        offset: number;
        total_pages: number;
        current_page: number;
    };
}

export interface CrearProyectoData {
    nombreProyecto: string;
    nroProyecto: string;
    idTipoProyecto: number;
    idPais: number;
    direccion1?: string;
    direccion2?: string;
    ciudad?: string;
    provincia?: string;
    codigoPostal?: string;
    idZonaHoraria?: number;
    fechaInicio?: string;
    fechaFinalizacion?: string;
    valorProyecto?: number;
    idTipoMoneda?: number;
    diaValorizar?: number;
    idCliente?: number;
    observaciones?: string;
    idModalidad?: number;
    idEstadoProyecto?: number;
    idEstadoCotizacion?: number;
    idUsuarioCreacion: number;
    idCoordinador?: number | null;
}

export interface EditarProyectoData extends CrearProyectoData {
    idProyecto: number;
    idUsuarioModificacion: number;
}

export interface AsignarAccesoProyectoResult {
    success: boolean;
    message: string;
    id?: number;
}

export interface ListarUsuariosDisponiblesParams {
    idProyecto: number;
    busqueda?: string;
    limit?: number;
    offset?: number;
    idRol?: number;
}

export interface CrearDocumentoProyectoData {
    idTipoDocumento: number;
    nombre: string;
    linkDocumento?: string;
}

export interface ActualizarDocumentoProyectoData {
    idTipoDocumento: number;
    nombre: string;
    linkDocumento?: string;
}

export interface IProyectoRepository {
    listarProyectos(params: ListarProyectosParams): Promise<ListarProyectosResponse>;
    obtenerProyectoPorId(idProyecto: number): Promise<any>;
    crearProyecto(data: CrearProyectoData): Promise<any>;
    editarProyecto(data: EditarProyectoData): Promise<any>;
    eliminarProyecto(idProyecto: number, idUsuarioModificacion: number): Promise<any>;
    listarUsuariosProyecto(idProyecto: number): Promise<any[]>;
    asignarAccesoProyecto(idProyecto: number, idUsuario: number, idNivelAcceso: number | null, idUsuarioCreacion: number): Promise<AsignarAccesoProyectoResult>;
    actualizarNivelAccesoProyecto(idAcceso: number, idNivelAcceso: number, idUsuarioModificacion: number): Promise<{ success: boolean; message: string }>;
    removerAccesoProyecto(idAcceso: number, idUsuarioModificacion: number): Promise<{ success: boolean; message: string }>;
    listarUsuariosDisponiblesProyecto(params: ListarUsuariosDisponiblesParams): Promise<{ data: any[]; total: number }>;
    listarDocumentosProyecto(idProyecto: number): Promise<any[]>;
    crearDocumentoProyecto(idProyecto: number, data: CrearDocumentoProyectoData, idUsuarioCreacion: number): Promise<AsignarAccesoProyectoResult>;
    actualizarDocumentoProyecto(idDocumento: number, data: ActualizarDocumentoProyectoData, idUsuarioModificacion: number): Promise<{ success: boolean; message: string }>;
    eliminarDocumentoProyecto(idDocumento: number, idUsuarioModificacion: number): Promise<{ success: boolean; message: string }>;
}

export const PROYECTO_REPOSITORY = 'PROYECTO_REPOSITORY';
