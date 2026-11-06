/**
 * Rango de fechas del periodo del dashboard.
 * Campos ausentes = la función SQL aplica su periodo por defecto
 * (mes actual, o semana actual en los indicadores semanales).
 */
export interface DashboardRangoFechas {
  fechaInicio?: string;
  fechaFin?: string;
}

export interface DashboardCantidadProyectosVigentes {
  cantidad: number;
}

export interface IDashboardRepository {
  /** Snapshot del estado actual: no depende del periodo. */
  cantidadProyectosVigentes(): Promise<DashboardCantidadProyectosVigentes>;
  /** Snapshot del estado actual: no depende del periodo. */
  cantidadTrabajadoresActivos(): Promise<DashboardCantidadTrabajadoresActivos>;
  cantidadActividadesPendientes(
    rango?: DashboardRangoFechas,
  ): Promise<DashboardCantidadActividadesPendientes>;
  cantidadActividadesObservadas(
    rango?: DashboardRangoFechas,
  ): Promise<DashboardCantidadActividadesObservadas>;
  cantidadActividadesRechazadas(
    rango?: DashboardRangoFechas,
  ): Promise<DashboardCantidadActividadesRechazadas>;
  /** Snapshot de accesos vigentes: no depende del periodo. */
  cantidadTrabajadoresPorProyecto(): Promise<
    DashboardCantidadTrabajadoresPorProyecto[]
  >;
  cantidadJornadasCompletasSemana(
    rango?: DashboardRangoFechas,
  ): Promise<DashboardCantidadJornadasCompletasSemana[]>;
  topTrabajadoresHorasMes(
    rango?: DashboardRangoFechas,
  ): Promise<DashboardTopTrabajadoresHorasMes[]>;
  cantidadTrabajadoresConectadoSemana(
    rango?: DashboardRangoFechas,
  ): Promise<DashboardCantidadTrabajadoresConectadoSemana[]>;
  horasEsperadasVsRegistradasMes(
    rango?: DashboardRangoFechas,
  ): Promise<DashboardHorasEsperadasVsRegistradasMes[]>;
  /** Avance calculado contra la fecha actual: no depende del periodo. */
  proyectosConProgreso(): Promise<DashboardProyectosConProgreso[]>;
  actividadesPorValidarPorCoordinador(
    rango?: DashboardRangoFechas,
  ): Promise<DashboardActividadesPorValidarPorCoordinador[]>;
  topTrabajadoresJornadasCerradas(
    rango?: DashboardRangoFechas,
  ): Promise<DashboardTopTrabajadoresJornadasCerradas[]>;
  topCoordinadoresActividadesValidadas(
    rango?: DashboardRangoFechas,
  ): Promise<DashboardTopCoordinadoresActividadesValidadas[]>;
}

export interface DashboardCantidadTrabajadoresActivos {
  cantidad: number;
}

export interface DashboardCantidadActividadesPendientes {
  dash_CantidadActividadesPendientes: number;
}
export interface DashboardCantidadActividadesObservadas {
  dash_CantidadActividadesObservadas: number;
}
export interface DashboardCantidadActividadesRechazadas {
  dash_CantidadActividadesRechazadas: number;
}
export interface DashboardCantidadTrabajadoresPorProyecto {
  id: number;
  nombreProyecto: string;
  cantidadTrabajadores: number;
}
export interface DashboardCantidadJornadasCompletasSemana {
  /** Fecha del punto (YYYY-MM-DD); permite ordenar rangos que cruzan meses. */
  fecha: string;
  /** Etiqueta corta del día (Lun, Mar, …). */
  dia: string;
  cantidad: number;
}
export interface DashboardTopTrabajadoresHorasMes {
  tipo: string;
  posicion: number;
  nombreTrabajador: string;
  horasRegistradas: number;
}
export interface DashboardCantidadTrabajadoresConectadoSemana {
  /** Fecha del punto (YYYY-MM-DD); permite ordenar rangos que cruzan meses. */
  fecha: string;
  /** Etiqueta corta del día (Lun, Mar, …). */
  dia: string;
  cantidad: number;
}
export interface DashboardHorasEsperadasVsRegistradasMes {
  /** Fecha del punto (YYYY-MM-DD); `dia` es ambiguo en rangos multi-mes. */
  fecha: string;
  dia: number;
  horasEsperadas: number;
  horasRegistradas: number;
  totalTrabajadoresEsperados: number;
  totalTrabajadoresRegistrados: number;
}

export interface DashboardProyectosConProgreso {
  nombreProyecto: string;
  tipoProyecto: string;
  estadoProyecto: string;
  progresoPorcentaje: number;
}

/** Actividades en estado «Por aprobar» (374) agrupadas por coordinador asignado. */
export interface DashboardActividadesPorValidarPorCoordinador {
  idCoordinador: number;
  nombreCoordinador: string;
  correoCoordinador: string | null;
  actividadesPorValidar: number;
}

/** Trabajadores con más jornadas cerradas sin actividades (estado 399) en el periodo. */
export interface DashboardTopTrabajadoresJornadasCerradas {
  idTrabajador: number;
  nombreTrabajador: string;
  jornadasCerradas: number;
}

/** Coordinadores con más actividades aprobadas (estado 375) en el periodo. */
export interface DashboardTopCoordinadoresActividadesValidadas {
  idCoordinador: number;
  nombreCoordinador: string;
  actividadesValidadas: number;
  /** Actividades del coordinador en el periodo (estados 374, 375, 376 y 377). */
  actividadesTotales: number;
  /** `actividadesValidadas` sobre `actividadesTotales`; 100 = nada sin resolver. */
  porcentajeValidadas: number;
}

export const DASHBOARD_REPOSITORY = 'DASHBOARD_REPOSITORY';
