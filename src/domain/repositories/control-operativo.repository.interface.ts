export interface ListarJornadasTrabajadorParams {
    idTrabajador: number;
    fechaInicio?: string;
    fechaFin?: string;
    limit?: number;
    offset?: number;
}

export interface ListarJornadasTrabajadorResult {
    data: JornadaListItem[];
    totalCount: number;
}

export interface JornadaListItem {
    idjornada: number | null;
    idconfiguracionjornada: number;
    idestadojornada?: number | null;
    idtrabajador?: number;
    nombretrabajador?: string | null;
    idcoordinador?: number | null;
    nombrecoordinador?: string | null;
    diajornada: string;
    fecha: string;
    horasesperadas: number;
    estadojornada: string;
}

export interface CrearJornadaParams {
    idTrabajador: number;
    fechaJornada: string; // YYYY-MM-DD
    idConfiguracionJornada?: number;
    idEstadoJornada?: number;
    horasEsperadas?: number;
}

/** Respuesta de crear jornada: incluye ids de configuración y estado usados. */
export interface JornadaCreada {
    idjornada: number;
    idtrabajador: number;
    idconfiguracionjornada: number;
    idestadojornada: number;
    diajornada: string;
    fecha: string;
    horasesperadas: number;
    estadojornada: string;
}

export interface ListarActividadesParams {
    idJornada?: number;
    idTrabajador?: number;
    idProyecto?: number;
    idEstadoActividad?: number;
}

export interface ActividadListItem {
    id: number;
    idjornada: number;
    idproyecto: number;
    nombreproyecto: string | null;
    idtrabajador: number;
    idcoordinador: number;
    idtipoactividad: number;
    nombreactividad: string;
    descripciondetallada: string | null;
    horainicio: string;
    horafin: string;
    horasdedicadas: number;
    linkevidencia: string | null;
    idestadoactividad: number;
    estadoactividad: string | null;
}

/** Retorno del cron único de cierre de jornadas (concroncierrejornadas). */
export interface CronCierreJornadasResult {
    insertados_alerta: number;
    pasados_incompleto: number;
    pasados_completado: number;
}

/** Item devuelto por tra_listar_trabajadores_para_filtro (para filtro por trabajador en jornadas). */
export interface TrabajadorParaFiltro {
    idtrabajador: number;
    nombres: string | null;
    apellidos: string | null;
    nombrecompleto: string | null;
}

export interface IControlOperativoRepository {
    listarJornadasTrabajador(params: ListarJornadasTrabajadorParams): Promise<ListarJornadasTrabajadorResult>;
    listarTrabajadoresParaFiltro(idTrabajador: number): Promise<TrabajadorParaFiltro[]>;
    crearJornada(params: CrearJornadaParams): Promise<JornadaCreada | null>;
    listarActividades(params: ListarActividadesParams): Promise<ActividadListItem[]>;
    ejecutarCronCierreJornadas(fecha: string): Promise<CronCierreJornadasResult>;
    actualizarEstadoJornada(idJornada: number, idEstadoJornada: number, idUsuarioModificacion?: number): Promise<boolean>;
}

export const CONTROL_OPERATIVO_REPOSITORY = 'CONTROL_OPERATIVO_REPOSITORY';
