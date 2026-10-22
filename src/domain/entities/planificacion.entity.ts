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
  idasignacion: number;
  idtrabajador: number;
  minutos: number;
  inicio: string;
  fin: string;
  idversioncalendario: number;
}
export interface FechaActividadPlan {
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
