export interface ListarJornadasTrabajadorParams {
    idTrabajador: number;
    fechaInicio?: string;
    fechaFin?: string;
}

export interface JornadaListItem {
    idjornada: number | null;
    idconfiguracionjornada: number;
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

export interface IControlOperativoRepository {
    listarJornadasTrabajador(params: ListarJornadasTrabajadorParams): Promise<JornadaListItem[]>;
    crearJornada(params: CrearJornadaParams): Promise<JornadaCreada | null>;
    listarActividades(params: ListarActividadesParams): Promise<ActividadListItem[]>;
}

export const CONTROL_OPERATIVO_REPOSITORY = 'CONTROL_OPERATIVO_REPOSITORY';
