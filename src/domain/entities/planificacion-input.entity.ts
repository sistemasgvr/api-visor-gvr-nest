export interface ContextoPlan {
  id: number;
  idPlan?: number;
  idActividad?: number;
  idAmpliacion?: number;
}
export interface CrearPlanInput {
  idaprobador?: number;
}
export interface RevisionPlanInput {
  revisionPlan: number;
  motivo?: string;
}
export interface RevisionActividadInput extends RevisionPlanInput {
  revision: number;
}
export interface MotivoPlanInput extends RevisionPlanInput {
  motivo: string;
}
export interface ReglasPlan {
  idaprobador?: number | null;
  bloquearexceso?: boolean;
  toleranciaporcentaje?: number;
  alertaporcentaje?: number;
  permitirnoplaneadas?: boolean;
}
export interface ReglasPlanInput extends RevisionPlanInput {
  reglas: ReglasPlan;
}
export interface PersonaPlan {
  idtrabajador: number;
  minutosasignados: number;
}
export interface DependenciaPlan {
  idpredecesora: number;
  desfasedias: number;
}
export interface DatosActividadPlan {
  identregable?: number;
  nombre?: string;
  descripcion?: string;
  eshito?: boolean;
  minutosestimados?: number;
  orden?: number;
  fechanoiniciarantes?: string | null;
  fechanofinalizarantes?: string | null;
  fechalimite?: string | null;
  asignaciones?: PersonaPlan[];
}
export interface CrearActividadPlanInput extends RevisionPlanInput {
  datos: DatosActividadPlan & { identregable: number; nombre: string };
}
export interface EditarActividadPlanInput extends RevisionActividadInput {
  datos: DatosActividadPlan;
}
export interface AsignacionesPlanInput extends RevisionPlanInput {
  revisionActividad: number;
  asignaciones: PersonaPlan[];
}
export interface DependenciasPlanInput extends RevisionPlanInput {
  dependencias: DependenciaPlan[];
}
export interface OrdenPlanInput extends RevisionPlanInput {
  entregables: number[];
  actividades: number[];
}
export interface CambiosCronograma {
  idactividad?: number;
  fechanoiniciarantes?: string | null;
  fechanofinalizarantes?: string | null;
  actividades?: {
    idactividad: number;
    fechanoiniciarantes?: string | null;
    fechanofinalizarantes?: string | null;
    orden?: number;
  }[];
  asignaciones?: { idactividad: number; personas: PersonaPlan[] }[];
  dependencias?: { idsucesora: number; predecesoras: DependenciaPlan[] }[];
  entregables?: { identregable: number; orden: number }[];
}
export interface PrevisualizarPlanInput {
  cambios: CambiosCronograma;
}
export interface LineaBaseInput extends MotivoPlanInput {
  nombre: string;
}
export interface ReprogramarPlanInput extends RevisionActividadInput {
  motivo: string;
  fechaNoIniciarAntes?: string | null;
  fechaNoFinalizarAntes?: string | null;
}
export interface EstadoActividadPlanInput extends RevisionActividadInput {
  motivo: string;
  idEstadoDestino: number;
}
export interface EstadoPlanInput extends MotivoPlanInput {
  idEstadoDestino: number;
}
export interface PaginacionPlanInput {
  offset?: number;
  limite?: number;
}
export interface HistorialPlanInput extends PaginacionPlanInput {
  tipo: 'cambios' | 'movimientos' | 'lineasbase' | 'detallelineabase';
  idLineaBase?: number;
}
export interface ResolverAmpliacionInput {
  minutosAprobados: number;
  resolucion: string;
}
export interface MisAsignacionesInput {
  fecha: string;
  idProyecto?: number;
}
export interface EstadoParteInput {
  revision: number;
  idEstadoDestino: number;
  motivo: string;
}
export interface SolicitarAmpliacionInput {
  minutos: number;
  motivo: string;
}
export interface MisAmpliacionesInput extends PaginacionPlanInput {
  idPlan: number;
}
