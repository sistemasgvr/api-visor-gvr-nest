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

/** Fila de conActividadEvidencia expuesta en listados y detalle (URL desde genArchivo). */
export interface ActividadEvidenciaItem {
  id: number;
  idArchivo: number;
  url: string;
  orden: number;
  /** Nombre de visualización (incl. formato amigable) guardado en genArchivo. */
  nombreOriginal?: string | null;
  tipoMime?: string | null;
  tamanoBytes?: number | null;
  /** URL de lectura (p. ej. presignada) para imágenes y descargas. */
  viewUrl?: string;
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
  incidenciadetallada?: string | null;
  identregable?: number | null;
  nombreentregable?: string | null;
  entregableculminado?: boolean;
  horainicio: string;
  horafin: string;
  horasdedicadas: number;
  linkevidencia: string | null;
  idestadoactividad: number;
  estadoactividad: string | null;
  idmodalidad?: number | null;
  nombremodalidad?: string | null;
  evidencias?: ActividadEvidenciaItem[];
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
  /** Actividades en estado "Por aprobar" en todo el listado filtrado (no solo la página). */
  countPorAprobar: number;
  /** Actividades "Por aprobar" con más de 7 días sin validar en todo el listado (todas las páginas). */
  countVencidas: number;
}

export interface ListarActividadesObservadasSubsanarParams {
  idTrabajadorSesion: number;
  idProyectoFiltro?: number | null;
  limit?: number;
  offset?: number;
}

export interface ListarActividadesObservadasSubsanarResult {
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
  fechaFin: string; // YYYY-MM-DD
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
  /** Entregable del proyecto (opcional). */
  idEntregable?: number | null;
  incidenciaDetallada?: string | null;
  entregableCulminado?: boolean;
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
  identregable?: number | null;
  incidenciadetallada?: string | null;
  entregableculminado?: boolean;
}

/** Parámetros para validar una actividad (convalidaractividad): Aprobar / Observar / Rechazar. */
export interface ValidarActividadParams {
  idActividad: number;
  idEstadoActividad: number; // 375 Aprobado, 376 Observado, 377 Rechazado
  comentarioValidacion?: string | null;
  idCoordinadorRevisor: number; // idTrabajador del usuario que revisa
  idUsuarioModificacion?: number | null;
  /** True solo si el usuario es Administrador Sistemas o Administrador GVR (alcance total en validación). */
  esAdminTotalValidacion: boolean;
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
  idEntregable?: number | null;
  incidenciaDetallada?: string | null;
  entregableCulminado?: boolean;
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
  incidenciadetallada?: string | null;
  identregable?: number | null;
  nombreentregable?: string | null;
  entregableculminado?: boolean;
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
  evidencias?: ActividadEvidenciaItem[];
}

/** Registrar URLs de evidencias (con_AgregarEvidenciasActividad). */
export interface ActividadEvidenciaEntrada {
  url: string;
  nombreOriginal?: string | null;
  tipoMime?: string | null;
  tamanoBytes?: number | null;
}

export interface AgregarEvidenciasActividadParams {
  idActividad: number;
  evidencias: ActividadEvidenciaEntrada[];
  idUsuario: number;
}

export interface EliminarEvidenciaActividadParams {
  idActividad: number;
  idEvidencia: number;
  idUsuario: number;
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

/** Fila de con_ListarActividadesPeriodoReporte (portada + detalle informe Word). */
export interface ActividadInformeServicioLinea {
  diajornada: string | null;
  nombreactividad: string;
  /** Nombre del tipo de actividad (genlistadoopciones); puede ir vacío en datos antiguos. */
  nombretipoactividad?: string | null;
  nombreproyecto: string | null;
  descripciondetallada: string | null;
  nombremodalidad: string | null;
  horasdedicadas: number | null;
  estadoactividad: string | null;
  /** Hora inicio actividad (HH:mm:ss). */
  horainicio?: string | null;
  /** Link libre histórico en la actividad (si existe). */
  linkevidencia?: string | null;
  evidencias?: ActividadEvidenciaItem[];
  /** Resumen «tipo (o nombre actividad) - proyecto» para viñetas / deduplicado. */
  linea: string;
  /** Entregable asociado (v2 reporte Word). */
  identregable?: number | null;
  nombreentregable?: string | null;
  entregableculminado?: boolean | null;
}

/** Retorno del cron único de cierre de jornadas (concroncierrejornadas). */
export interface CronCierreJornadasResult {
  /** Filas nuevas en estado Abierta (columna SQL `insertados_abierta`). */
  insertados_abierta: number;
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
  /**
   * Opcional: id trabajador líder (coordinador de proyecto / responsable /
   * coordinador en actividad). Solo actividades de personal bajo su cargo.
   */
  idLiderEquipo?: number | null;
  limit?: number;
  offset?: number;
}

/** Líder disponible para filtro del reporte general (admin). */
export interface LiderEquipoReporteGeneralItem {
  idtrabajador: number;
  nombrecompleto: string | null;
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
  /** URLs de visualización/descarga de imágenes cargadas como evidencia. */
  evidenciasImagenes?: string[];
  /** Texto consolidado (una URL por línea) para exportaciones tipo Excel. */
  evidenciasImagenesTexto?: string | null;
}

/** Resultado del reporte general de actividades. */
export interface ReporteGeneralResult {
  data: ReporteGeneralItem[];
  totalCount: number;
  totalHoras: number;
}

/** Parámetros de `con_ReporteHorasDedicadasRangoPorTrabajador` (fechas YYYY-MM-DD). */
export interface ReporteHorasTrabajadorRangoParams {
  fechaInicio: string;
  fechaFin: string;
  idTrabajadores?: number[] | null;
  idProyectos?: number[] | null;
  idEstadosActividad?: number[] | null;
  /** Meta horas por día para convertir a días equivalentes (default 8). */
  horasMetaDia?: number;
}

/** Una fila agregada por trabajador en el rango (todos los proyectos consolidados). */
export interface ReporteHorasTrabajadorRangoItem {
  idtrabajador: number;
  nombretrabajador: string | null;
  fechaInicioPeriodo: string | null;
  fechaFinPeriodo: string | null;
  horasdedicadas: number;
  cantidadActividades: number;
  diasCalendarioRango: number;
  diasEquivalente: number;
  textoResumen: string | null;
}

export interface ReporteHorasTrabajadorRangoResult {
  data: ReporteHorasTrabajadorRangoItem[];
  /** Suma de horasdedicadas en todas las filas devueltas. */
  totalHoras: number;
}

/** Detalle por colaborador y proyecto (misma ventana y filtros; sin meta diaria en SQL). */
export type ReporteHorasTrabajadorRangoDetalleProyectoParams = Omit<
  ReporteHorasTrabajadorRangoParams,
  'horasMetaDia'
>;

export interface ReporteHorasRangoTrabajadorProyectoDetalleItem {
  idtrabajador: number;
  nombretrabajador: string | null;
  idproyecto: number;
  nombreproyecto: string | null;
  nroproyecto: string | null;
  horasdedicadas: number;
  cantidadActividades: number;
}

export interface ReporteHorasRangoTrabajadorProyectoDetalleResult {
  data: ReporteHorasRangoTrabajadorProyectoDetalleItem[];
}

/** Actividad vencida retornada por el cron de alerta (> 7 días sin validar). */
export interface ActividadSinValidarItem {
  id: number;
  nombreActividad: string;
  idTrabajador: number;
  idProyecto: number;
  nombreProyecto: string | null;
  nombreTrabajador: string | null;
  fechaCreacion: string;
  diasVencido: number;
}

/** Grupo de actividades vencidas agrupadas por coordinador responsable de validarlas. */
export interface GrupoCoordinadorSinValidar {
  idCoordinador: number;
  nombreCoordinador: string;
  /** idUsuario en authUsuarios del coordinador (para notificarle si aplica). */
  idUsuarioCoordinador: number | null;
  /** id en traTrabajador del responsable directo del coordinador. */
  idResponsable: number | null;
  nombreResponsable: string | null;
  /** idUsuario en authUsuarios del responsable directo. */
  idUsuarioResponsable: number | null;
  cantidad: number;
  actividades: ActividadSinValidarItem[];
}

/** Resultado del cron de alerta de actividades sin validar. */
export interface CronAlertaActividadesSinValidarResult {
  gruposCoordinadores: GrupoCoordinadorSinValidar[];
  usuariosANotificar: number[];
  totalActividades: number;
}

/** Fila de con_DatosReporteActividades (PostgreSQL en snake_case). Se ampliará con más columnas. */
export interface DatosReporteActividadesRow {
  razonsocial: string | null;
  nombrecomercial: string | null;
  celularempresa: string | null;
  correoempresa: string | null;
  urllogo: string | null;
  nombrecompletotrabajador: string | null;
  /** DNI / documento del trabajador (tratrabajador.nrodocumento). */
  nrodocumento: string | null;
  puesto_trabajo: string | null;
  eslogan_anio: string | null;
  ciudad_documento: string | null;
  linea_destinatario: string | null;
  /** URL genarchivo (MinIO/path) para la imagen de firma del trabajador. */
  url_firma_trabajador?: string | null;
  /** Texto multilinea (CHR 10): dirección de la empresa para el pie del informe. */
  direccion_pie_empresa?: string | null;
}

export interface IControlOperativoRepository {
  listarJornadasTrabajador(
    params: ListarJornadasTrabajadorParams,
  ): Promise<ListarJornadasTrabajadorResult>;
  listarTrabajadoresParaFiltro(
    idTrabajador: number,
  ): Promise<TrabajadorParaFiltro[]>;
  listarProyectosAccesoTrabajador(
    idTrabajador: number,
    soloVigentes?: boolean,
  ): Promise<ProyectoAccesoTrabajador[]>;
  /** Proyectos alineados con el alcance de validación (no incluye “todos” para Gerencia). */
  listarProyectosParaValidacion(
    idTrabajador: number,
  ): Promise<ProyectoAccesoTrabajador[]>;
  puedeValidarActividad(
    idActividad: number,
    idRevisor: number,
    esAdminTotalValidacion: boolean,
  ): Promise<boolean>;
  listarTrabajadoresSinJornadaHoy(
    fecha: string,
  ): Promise<TrabajadorSinJornadaHoyItem[]>;
  listarTrabajadoresSinActividadesHoy(
    fecha: string,
  ): Promise<TrabajadorSinActividadesHoyItem[]>;
  /** Total de trabajadores que deben tener jornada en la fecha (para dashboard). */
  contarTrabajadoresEsperadosJornadaHoy(fecha: string): Promise<number>;
  /** Total de trabajadores con jornada en la fecha (para dashboard sin actividades). */
  contarTrabajadoresConJornadaHoy(fecha: string): Promise<number>;
  crearJornada(params: CrearJornadaParams): Promise<JornadaCreada | null>;
  listarActividades(
    params: ListarActividadesParams,
  ): Promise<ListarActividadesResult>;
  listarActividadesValidacion(
    params: ListarActividadesValidacionParams,
  ): Promise<ListarActividadesValidacionResult>;
  listarActividadesObservadasSubsanar(
    params: ListarActividadesObservadasSubsanarParams,
  ): Promise<ListarActividadesObservadasSubsanarResult>;
  listarValorizacion(
    params: ListarValorizacionParams,
  ): Promise<ListarValorizacionResult>;
  listarTrabajadoresPorProyecto(
    idProyecto: number,
  ): Promise<TrabajadorPorProyectoItem[]>;
  listarDesempeno(
    params: ListarDesempenoParams,
  ): Promise<ListarDesempenoResult>;
  obtenerActividad(idActividad: number): Promise<ActividadDetalle | null>;
  listarObservacionesActividad(
    idActividad: number,
  ): Promise<ObservacionActividad[]>;
  obtenerIdTrabajadorPorIdUsuario(idUsuario: number): Promise<number | null>;
  /** idUsuario del trabajador (tratrabajador.idusuario) para notificaciones. */
  obtenerIdUsuarioPorIdTrabajador(idTrabajador: number): Promise<number | null>;
  /** id del responsable (tratrabajador.idresponsable) del trabajador, para notificar al responsable. */
  obtenerIdResponsablePorIdTrabajador(
    idTrabajador: number,
  ): Promise<number | null>;
  /** Nombre completo del trabajador (nombres + apellidos) para mostrar en notificaciones. */
  obtenerNombreTrabajadorPorId(idTrabajador: number): Promise<string | null>;
  crearActividad(params: CrearActividadParams): Promise<ActividadCreada | null>;
  agregarEvidenciasActividad(
    params: AgregarEvidenciasActividadParams,
  ): Promise<number>;
  /**
   * Baja lógica de una evidencia (conActividadEvidencia + genArchivo).
   * Devuelve la URL almacenada o null si no aplica.
   */
  eliminarEvidenciaActividad(
    params: EliminarEvidenciaActividadParams,
  ): Promise<string | null>;
  actualizarActividad(
    params: ActualizarActividadParams,
  ): Promise<ActividadCreada | null>;
  validarActividad(
    params: ValidarActividadParams,
  ): Promise<ActividadCreada | null>;
  eliminarActividad(idActividad: number): Promise<boolean>;
  ejecutarCronCierreJornadas(fecha: string): Promise<CronCierreJornadasResult>;
  /** Detecta actividades "Por Aprobar" (374) con más de 7 días desde su creación,
   *  marca la fecha de alerta (deduplicación) y devuelve los datos para notificar
   *  a Administradores y Gerencia vía WebSocket. */
  ejecutarCronAlertaActividadesSinValidar(
    fecha: string,
  ): Promise<CronAlertaActividadesSinValidarResult>;
  actualizarEstadoJornada(
    idJornada: number,
    idEstadoJornada: number,
    idUsuarioModificacion?: number,
  ): Promise<boolean>;
  listarReporteGeneral(
    params: ReporteGeneralParams,
  ): Promise<ReporteGeneralResult>;
  listarLideresEquipoReporteGeneral(): Promise<LiderEquipoReporteGeneralItem[]>;
  listarReporteHorasDedicadasRangoPorTrabajador(
    params: ReporteHorasTrabajadorRangoParams,
  ): Promise<ReporteHorasTrabajadorRangoResult>;
  listarReporteHorasDedicadasRangoPorTrabajadorYProyecto(
    params: ReporteHorasTrabajadorRangoDetalleProyectoParams,
  ): Promise<ReporteHorasRangoTrabajadorProyectoDetalleResult>;
  /** Datos para el reporte de actividades (Word): hoy portada; `anioInforme` = leyenda del año en genconfiguraciongeneral. */
  obtenerDatosReporteActividades(
    idTrabajador: number,
    anioInforme: number,
  ): Promise<DatosReporteActividadesRow | null>;
  /** Actividades del trabajador en [fechaInicioYmd, fechaFinYmd] por fecha de jornada (texto actividad — proyecto). */
  listarActividadesPeriodoReporte(
    idTrabajador: number,
    fechaInicioYmd: string,
    fechaFinYmd: string,
  ): Promise<ActividadInformeServicioLinea[]>;
}

export const CONTROL_OPERATIVO_REPOSITORY = 'CONTROL_OPERATIVO_REPOSITORY';
