/** JSON de planificación: las fechas civiles se conservan como YYYY-MM-DD.
 * Se exponen los metadatos de revisión y auditoría para el historial y concurrencia.
 * No se exponen filas del driver ni datos de conexión. */
export type PlanificacionJson =
  | null
  | boolean
  | number
  | string
  | PlanificacionJson[]
  | { [key: string]: PlanificacionJson };
export interface CalendarioPlan {
  idcalendario: number;
  nombre: string;
  idversion: number;
  dias: { fecha: string; minutos: number; nombre: string | null }[];
}
export interface AprobadorPlan {
  idtrabajador: number;
  nombre: string;
  foto: string | null;
  puesto: string | null;
  escoordinador: boolean;
}
export interface MiembroEquipoPlan {
  idtrabajador: number;
  nombre: string;
  foto: string | null;
  puesto: string | null;
  idcalendario: number | null;
  tienecalendariopublicado: boolean;
}
export interface EstadoPlanProyecto {
  metricas?: {
    avancereal: number | null;
    avanceplan: number | null;
    minutosregistrados: number;
    minutosplanificados: number;
    fechafinplanificada: string | null;
    desviodiashabiles: number | null;
    semaforo:
      | 'atrasado'
      | 'alerta'
      | 'enplazo'
      | 'poriniciar'
      | 'revision'
      | 'culminado'
      | null;
    aviso: string | null;
  };
  idproyecto: number;
  idplan: number;
  idestadoplan: number;
  revision: number;
  publicadoen: string | null;
}
export interface PlanProyecto {
  id: number;
  idproyecto: number;
  revision: number;
  idestadoplan: number;
  idaprobador: number | null;
  publicadoen: string | null;
}
export interface PlanProyectoDetalle {
  idproyecto: number;
  plan: PlanProyecto | null;
}
export interface AsignacionContexto {
  idproyecto: number;
  idestadoactividad: number;
  idtrabajador: number;
}

export interface ActividadPlan {
  id: number;
  idplan: number;
  idproyecto: number;
  identregable: number;
  nombre: string;
  minutosestimados: number;
  eshito: boolean;
  revision: number;
  idestadoactividad: number;
  /** Minutos registrados por todas sus partes (solo en la lectura del cronograma). */
  minutosconsumidos?: number;
}
export interface SaldoAsignacion {
  minutosautorizados: number;
  minutosconsumidos: number;
  minutossaldo: number;
  minutostope: number;
  minutossaldocontolerancia: number;
  bloquearexceso: boolean;
  activa: boolean;
}
export interface AsignacionPlan {
  id: number;
  idactividad: number;
  idtrabajador: number;
  minutosasignados: number;
  revision: number;
  idestadoactividad: number;
  saldo?: SaldoAsignacion;
}
export interface DependenciaActividadPlan {
  id: number;
  idpredecesora: number;
  idsucesora: number;
  desfasedias: number;
}
export interface FechaAsignacionPlan {
  periodosregistro?: { inicio: string; fin: string }[];
  tramos?: { inicio: string; fin: string }[];
  fechareanudacion?: string | null;
  iniciopendiente?: string | null;
  finpendiente?: string | null;
  minutospendientes?: number;
  idasignacion: number;
  idtrabajador: number;
  minutos: number;
  inicio: string;
  fin: string;
  idversioncalendario: number;
}
export interface FechaActividadPlan {
  duracionlaboral?: { dias: number; minutos: number } | null;
  idactividad: number;
  idplan: number;
  inicio: string;
  fin: string;
  asignaciones: FechaAsignacionPlan[];
  superafechalimite: boolean;
  superafinproyecto: boolean;
  culminada?: boolean;
}
export interface CronogramaProyecto {
  plan: PlanProyecto;
  entregables: PlanificacionJson[];
  actividades: ActividadPlan[];
  asignaciones: AsignacionPlan[];
  dependencias: DependenciaActividadPlan[];
  fechas: FechaActividadPlan[];
}
export interface ActividadPlanDetalle {
  actividad: ActividadPlan;
  asignaciones: AsignacionPlan[];
  dependencias: DependenciaActividadPlan[];
}
export interface PrevisualizacionCronograma {
  revisionplan: number;
  antes: FechaActividadPlan[];
  despues: FechaActividadPlan[];
  afectadas: FechaActividadPlan[];
  afectacapacidadotrosproyectos: boolean;
}
export interface ResultadoLineaBase {
  idlineabase: number;
  revisionplan: number;
}
export interface AmpliacionPlan {
  id: number;
  idasignacion: number;
  minutossolicitados: number;
  minutosaprobados: number | null;
  idestadosolicitud: number;
}
export interface BandejaAmpliaciones {
  fechahoy: string;
  total: number;
  pendientes: number;
  pendientesporactividad: { idactividad: number; cantidad: number }[];
  esaprobador: boolean;
  puederesolver: boolean;
  nombreaprobador: string | null;
  revisionplan: number;
  solicitudes: (AmpliacionPlan & {
    idactividad: number;
    nombreactividad: string;
    nombreentregable: string;
    nombresolicitante: string;
    nombrerevisor: string | null;
    motivo: string;
    resolucion: string | null;
    solicitadaen: string;
    resueltaen: string | null;
    minutosasignados: number;
    minutosconsumidos: number;
    minutossaldo: number;
    puedeaprobar: boolean;
    puederechazar: boolean;
    puedereprogramar: boolean;
    fechareanudacion: string | null;
    fechareanudacionvigente: string | null;
  })[];
}
export interface PrevisualizacionReanudacion {
  revisionplan: number;
  huella: string;
  fechareanudacion: string;
  fechahoy: string;
  minutosconsumidos: number;
  minutospendientes: number;
  inicioefectivo: string | null;
  finefectivo: string | null;
  afectaotrosproyectos: boolean;
  reprogramacion: boolean;
  afectadas: {
    idactividad: number;
    nombre: string;
    inicioanterior: string | null;
    finanterior: string | null;
    inicio: string | null;
    fin: string | null;
    superafinproyecto: boolean | null;
    superafechalimite: boolean | null;
    /** Actividad de la solicitud; las demás cambian por dependencias o capacidad compartida. */
    solicitada: boolean;
    /** Partes cuyas fechas cambian, aunque la actividad conserve su intervalo global. */
    partes: {
      idasignacion: number;
      idtrabajador: number;
      nombre: string | null;
      inicioanterior: string | null;
      finanterior: string | null;
      inicio: string | null;
      fin: string | null;
    }[];
  }[];
}

export interface CambioEstadoActividadPlan {
  idactividad: number;
  revision: number;
  revisionplan: number;
  idestadoactividad: number;
}
export interface CambioEstadoPlan {
  idplan: number;
  revision: number;
  idestadoplan: number;
}
export interface CambioEstadoPartePlan {
  idasignacion: number;
  revision: number;
  idestadoactividad: number;
}
export interface AsignacionColaboradorPlan extends AsignacionPlan {
  periodosregistro?: { inicio: string; fin: string }[] | null;
  iniciopendiente?: string | null;
  finpendiente?: string | null;
  fechareanudacion?: string | null;
  idproyecto: number;
  nombre: string;
  identregable: number;
  nombreentregable: string;
  idplan: number;
  idestadoactividadplan: number;
  /** Código EDT del cronograma: entregable.actividad. */
  codigo: string;
  fecha: string;
  /** Fechas calculadas de la actividad y de la parte; nulas si el plan no puede calcularse. */
  inicio: string | null;
  fin: string | null;
  iniciopersona: string | null;
  finpersona: string | null;
  saldo: SaldoAsignacion;
}
export interface PlanColaborador {
  idplan: number;
  idproyecto: number;
  nroproyecto: string | null;
  nombreproyecto: string;
  idestadoplan: number;
  bloquearexceso: boolean;
  toleranciaporcentaje: number;
  alertaporcentaje: number;
  permitirnoplaneadas: boolean;
  idaprobador: number | null;
  nombreaprobador: string | null;
}
export interface AsignacionesColaborador {
  planes: PlanColaborador[];
  asignaciones: AsignacionColaboradorPlan[];
}
