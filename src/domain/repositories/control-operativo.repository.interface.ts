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
    /** Duplicado explícito para clientes (lista jornadas). */
    idEstadoJornada?: number | null;
    idtrabajador?: number;
    nombretrabajador?: string | null;
    idcoordinador?: number | null;
    nombrecoordinador?: string | null;
    diajornada: string;
    fecha: string;
    horasesperadas: number;
    horas_registradas?: number | null;
    horas_aprobadas?: number | null;
    estadojornada: string;
    /** Conteo de actividades por estado: { "Por aprobar": 2, "Aprobado": 1 }. Null si no hay jornada o no hay actividades. */
    actividades_por_estado?: Record<string, number> | null;
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
    limit?: number;
    offset?: number;
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
    idmodalidad?: number | null;
    nombremodalidad?: string | null;
}

/** Item de actividad para listado Validación (incluye nombre del modelador/trabajador). */
export interface ActividadValidacionListItem extends ActividadListItem {
    nombretrabajador: string | null;
}

export interface ListarActividadesValidacionParams {
    idTrabajadorSesion: number;
    esAdmin: boolean;
    idTrabajadorFiltro?: number | null;
    idProyectoFiltro?: number | null;
    idEstadoActividadFiltro?: number | null;
    limit?: number;
    offset?: number;
}

export interface ListarActividadesValidacionResult {
    data: ActividadValidacionListItem[];
    totalCount: number;
    totalHoras: number;
}

/** Item de detalle de actividad dentro de un grupo de valorización (sustento cliente). */
export interface ValorizacionDetalleActividad {
    id: number;
    nombreactividad: string;
    horasdedicadas: number;
    diajornada: string;
    descripciondetallada?: string | null;
}

/** Grupo de valorización: por modelador y coordinador (solo actividades aprobadas). */
export interface ValorizacionGrupo {
    idtrabajador: number;
    nombremodelador: string | null;
    idcoordinador: number;
    nombrecoordinador: string | null;
    total_horas: number;
    detalle_actividades: ValorizacionDetalleActividad[];
}

export interface ListarValorizacionParams {
    idProyecto: number;
    fechaInicio: string; // YYYY-MM-DD
    fechaFin: string;   // YYYY-MM-DD
}

export interface ListarValorizacionResult {
    grupos: ValorizacionGrupo[];
    totalGeneralHoras: number;
}

/** Item de actividad rechazada para evaluación de desempeño. */
export interface DesempenoActividadRechazada {
    id: number;
    idtrabajador?: number | null;
    nombretrabajador: string | null;
    nombrecoordinador: string | null;
    diajornada: string;
    nombreactividad: string;
    horasdedicadas: number;
    comentario: string | null;
}

/** Item de observación (comentario coordinador) para evaluación de desempeño. */
export interface DesempenoObservacion {
    id: number;
    idactividad: number;
    idtrabajador?: number | null;
    nombretrabajador: string | null;
    nombrecoordinador: string | null;
    comentario: string | null;
    fechaobservacion: string | null;
    nombreactividad: string | null;
}

/** Item para filtro de trabajadores por proyecto (Desempeño). */
export interface TrabajadorPorProyectoItem {
    idtrabajador: number;
    nombretrabajador: string | null;
}

export interface ListarDesempenoParams {
    idProyecto: number;
    fechaInicio: string;
    fechaFin: string;
    /** Opcional: filtrar por un solo trabajador. */
    idTrabajador?: number | null;
}

export interface ListarDesempenoResult {
    totalActividadesRechazadas: number;
    totalObservaciones: number;
    totalHorasNoJustificadas: number;
    detalleActividadesRechazadas: DesempenoActividadRechazada[];
    detalleObservaciones: DesempenoObservacion[];
}

/** Parámetros para crear una actividad (concrearactividad). idCoordinador se resuelve desde el proyecto si no se envía. */
export interface CrearActividadParams {
    idJornada: number;
    idProyecto: number;
    idTrabajador: number;
    /** Coordinador del proyecto (proProyecto.idcoordinador). Opcional: el use case lo obtiene del proyecto si no se envía. */
    idCoordinador: number | null;
    idTipoActividad: number;
    nombreActividad: string;
    descripcionDetallada?: string | null;
    horaInicio?: string; // "HH:mm" o "HH:mm:ss"
    horaFin?: string;
    linkEvidencia?: string | null;
    idEstadoActividad?: number | null;
    idModalidad?: number | null;
    idUsuarioCreacion?: number | null;
}

/** Resultado de crear actividad (primera fila de concrearactividad). */
export interface ActividadCreada {
    id: number;
    idjornada: number;
    idproyecto: number;
    idtrabajador: number;
    idcoordinador: number | null;
    idtipoactividad: number;
    nombreactividad: string;
    horainicio: string;
    horafin: string;
    horasdedicadas: number;
    idestadoactividad: number;
    idmodalidad?: number | null;
}

/** Parámetros para validar una actividad (convalidaractividad): Aprobar / Observar / Rechazar. */
export interface ValidarActividadParams {
    idActividad: number;
    idEstadoActividad: number; // 375 Aprobado, 376 Observado, 377 Rechazado
    comentarioValidacion?: string | null;
    idCoordinadorRevisor: number; // idTrabajador del usuario que revisa
    idUsuarioModificacion?: number | null;
}

/** Parámetros para actualizar una actividad (conactualizaractividad). */
export interface ActualizarActividadParams {
    idActividad: number;
    idProyecto: number;
    idTrabajador: number;
    idCoordinador: number;
    idTipoActividad: number;
    nombreActividad: string;
    descripcionDetallada?: string | null;
    horaInicio?: string;
    horaFin?: string;
    linkEvidencia?: string | null;
    idModalidad?: number | null;
    idUsuarioModificacion?: number | null;
    /** Si true, la actividad debe estar en Observado y ser del mismo trabajador; al guardar pasa a Por aprobar. */
    corregirObservacion?: boolean;
}

/** Item de observación del coordinador sobre una actividad (conlistarobservacionesactividad). */
export interface ObservacionActividad {
    id: number;
    idactividad: number;
    idcoordinador: number;
    nombrecoordinador: string | null;
    comentario: string | null;
    fechaobservacion: string | null;
}

/** Resultado de conobteneractividad: una actividad con toda la información relacionada (para "Ver"). */
export interface ActividadDetalle {
    id: number;
    idjornada: number;
    idproyecto: number;
    nombreproyecto: string | null;
    nombrecliente: string | null;
    nroproyecto: string | null;
    idtrabajador: number;
    nombretrabajador: string | null;
    idcoordinador: number;
    nombrecoordinador: string | null;
    idtipoactividad: number;
    nombretipoactividad: string | null;
    nombreactividad: string;
    descripciondetallada: string | null;
    horainicio: string;
    horafin: string;
    horasdedicadas: number;
    linkevidencia: string | null;
    idestadoactividad: number;
    estadoactividad: string | null;
    idmodalidad: number | null;
    nombremodalidad: string | null;
    diajornada: string | null;
    horasesperadas: number | null;
    fechacreacion: string | null;
    fechamodificacion: string | null;
}

/** Resultado de listar actividades: filas + totales + meta de jornada (horasesperadas, diajornada, idestadojornada, estadojornada). */
export interface ListarActividadesResult {
    data: ActividadListItem[];
    totalCount: number;
    totalHoras: number;
    horasesperadas?: number | null;
    diajornada?: string | null;
    idestadojornada?: number | null;
    estadojornada?: string | null;
}

/** Retorno del cron único de cierre de jornadas (concroncierrejornadas). */
export interface CronCierreJornadasResult {
    insertados_alerta: number;
    actualizados_alerta: number;
    pasados_culminado: number;
    pasados_incompleto: number;
}

/** Item devuelto por traListarTrabajadoresParaFiltro (para filtro por trabajador en jornadas). */
export interface TrabajadorParaFiltro {
    idtrabajador: number;
    nombres: string | null;
    apellidos: string | null;
    nombrecompleto: string | null;
}

/** Item devuelto por proListarProyectosAccesoTrabajador (proyectos a los que tiene acceso el trabajador). */
export interface ProyectoAccesoTrabajador {
    idproyecto: number;
    nombreproyecto: string | null;
    nroproyecto: string | null;
    nombrecliente: string | null;
    idcoordinador: number | null;
    nombrecoordinador: string | null;
    /** True si el trabajador está registrado como coordinador del proyecto en proproyectocoordinador. */
    es_coordinador_del_proyecto?: boolean | null;
}

/** Item de trabajador que no ha registrado jornada en la fecha (para dashboard). */
export interface TrabajadorSinJornadaHoyItem {
    idtrabajador: number;
    nombrecompleto: string | null;
}

/** Item de trabajador que tiene jornada hoy pero no ha registrado actividades (para dashboard). */
export interface TrabajadorSinActividadesHoyItem {
    idtrabajador: number;
    nombrecompleto: string | null;
}

/** Parámetros para el reporte general de actividades. */
export interface ReporteGeneralParams {
    /** Vacío o null = sin filtrar por trabajador. */
    idTrabajadores?: number[] | null;
    /** Vacío o null = sin filtrar por proyecto. */
    idProyectos?: number[] | null;
    /** Vacío o null = sin filtrar por estado de actividad. */
    idEstadosActividad?: number[] | null;
    fechaInicio?: string | null;
    fechaFin?: string | null;
    limit?: number;
    offset?: number;
}

/** Item del reporte general de actividades. */
export interface ReporteGeneralItem {
    id: number;
    idjornada: number;
    idtrabajador: number | null;
    nombretrabajador: string | null;
    idcoordinador: number | null;
    nombrecoordinador: string | null;
    idproyecto: number | null;
    nombreproyecto: string | null;
    nombreactividad: string;
    descripciondetallada: string | null;
    horasdedicadas: number;
    horainicio: string | null;
    horafin: string | null;
    diajornada: string | null;
    idestadoactividad: number | null;
    estadoactividad: string | null;
    idmodalidad: number | null;
    nombremodalidad: string | null;
    idtipoactividad: number | null;
    nombretipoactividad: string | null;
    linkevidencia: string | null;
}

/** Resultado del reporte general de actividades. */
export interface ReporteGeneralResult {
    data: ReporteGeneralItem[];
    totalCount: number;
    totalHoras: number;
}

export interface IControlOperativoRepository {
    listarJornadasTrabajador(params: ListarJornadasTrabajadorParams): Promise<ListarJornadasTrabajadorResult>;
    listarTrabajadoresParaFiltro(idTrabajador: number): Promise<TrabajadorParaFiltro[]>;
    listarProyectosAccesoTrabajador(idTrabajador: number): Promise<ProyectoAccesoTrabajador[]>;
    listarTrabajadoresSinJornadaHoy(fecha: string): Promise<TrabajadorSinJornadaHoyItem[]>;
    listarTrabajadoresSinActividadesHoy(fecha: string): Promise<TrabajadorSinActividadesHoyItem[]>;
    /** Total de trabajadores que deben tener jornada en la fecha (para dashboard). */
    contarTrabajadoresEsperadosJornadaHoy(fecha: string): Promise<number>;
    /** Total de trabajadores con jornada en la fecha (para dashboard sin actividades). */
    contarTrabajadoresConJornadaHoy(fecha: string): Promise<number>;
    crearJornada(params: CrearJornadaParams): Promise<JornadaCreada | null>;
    listarActividades(params: ListarActividadesParams): Promise<ListarActividadesResult>;
    listarActividadesValidacion(params: ListarActividadesValidacionParams): Promise<ListarActividadesValidacionResult>;
    listarValorizacion(params: ListarValorizacionParams): Promise<ListarValorizacionResult>;
    listarTrabajadoresPorProyecto(idProyecto: number): Promise<TrabajadorPorProyectoItem[]>;
    listarDesempeno(params: ListarDesempenoParams): Promise<ListarDesempenoResult>;
    obtenerActividad(idActividad: number): Promise<ActividadDetalle | null>;
    listarObservacionesActividad(idActividad: number): Promise<ObservacionActividad[]>;
    obtenerIdTrabajadorPorIdUsuario(idUsuario: number): Promise<number | null>;
    /** idUsuario del trabajador (tratrabajador.idusuario) para notificaciones. */
    obtenerIdUsuarioPorIdTrabajador(idTrabajador: number): Promise<number | null>;
    /** id del responsable (tratrabajador.idresponsable) del trabajador, para notificar al responsable. */
    obtenerIdResponsablePorIdTrabajador(idTrabajador: number): Promise<number | null>;
    /** Nombre completo del trabajador (nombres + apellidos) para mostrar en notificaciones. */
    obtenerNombreTrabajadorPorId(idTrabajador: number): Promise<string | null>;
    crearActividad(params: CrearActividadParams): Promise<ActividadCreada | null>;
    actualizarActividad(params: ActualizarActividadParams): Promise<ActividadCreada | null>;
    validarActividad(params: ValidarActividadParams): Promise<ActividadCreada | null>;
    eliminarActividad(idActividad: number): Promise<boolean>;
    ejecutarCronCierreJornadas(fecha: string): Promise<CronCierreJornadasResult>;
    actualizarEstadoJornada(idJornada: number, idEstadoJornada: number, idUsuarioModificacion?: number): Promise<boolean>;
    listarReporteGeneral(params: ReporteGeneralParams): Promise<ReporteGeneralResult>;
}

export const CONTROL_OPERATIVO_REPOSITORY = 'CONTROL_OPERATIVO_REPOSITORY';
