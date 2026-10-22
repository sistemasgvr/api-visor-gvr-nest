import type * as Input from '../entities/planificacion-input.entity';
import type {
  PlanificacionJson,
  CambioEstadoActividadPlan,
  CambioEstadoPlan,
  CambioEstadoPartePlan,
  AsignacionColaboradorPlan,
  AsignacionContexto,
  ActividadPlan,
  ActividadPlanDetalle,
  AmpliacionPlan,
  CronogramaProyecto,
  PlanProyecto,
  PlanProyectoDetalle,
  PrevisualizacionCronograma,
  ResultadoLineaBase,
  AsignacionPlan,
  DependenciaActividadPlan,
  FechaActividadPlan,
} from '../entities/planificacion.entity';
export const PLANIFICACION_REPOSITORY = 'PLANIFICACION_REPOSITORY';
export interface IPlanificacionRepository {
  comprobarPertenencia(ctx: Input.ContextoPlan): Promise<void>;
  obtenerTrabajador(actor: number): Promise<number>;
  obtenerAsignacionPropia(
    actor: number,
    id: number,
  ): Promise<AsignacionContexto>;
  tienePlan(idProyecto: number): Promise<boolean>;
  obtenerPlan(
    actor: number,
    ctx: Input.ContextoPlan,
  ): Promise<PlanProyectoDetalle>;
  crearPlan(
    actor: number,
    ctx: Input.ContextoPlan,
    data: Input.CrearPlanInput,
  ): Promise<PlanProyecto>;
  obtenerCronograma(
    actor: number,
    ctx: Input.ContextoPlan,
  ): Promise<CronogramaProyecto>;
  actualizarReglas(
    actor: number,
    ctx: Input.ContextoPlan,
    data: Input.ReglasPlanInput,
  ): Promise<PlanProyecto>;
  crearActividad(
    actor: number,
    ctx: Input.ContextoPlan,
    data: Input.CrearActividadPlanInput,
  ): Promise<ActividadPlan>;
  obtenerActividad(
    actor: number,
    ctx: Input.ContextoPlan,
  ): Promise<ActividadPlanDetalle>;
  editarActividad(
    actor: number,
    ctx: Input.ContextoPlan,
    data: Input.EditarActividadPlanInput,
  ): Promise<ActividadPlan>;
  eliminarActividad(
    actor: number,
    ctx: Input.ContextoPlan,
    data: Input.RevisionActividadInput,
  ): Promise<boolean>;
  guardarAsignaciones(
    actor: number,
    ctx: Input.ContextoPlan,
    data: Input.AsignacionesPlanInput,
  ): Promise<AsignacionPlan[]>;
  guardarDependencias(
    actor: number,
    ctx: Input.ContextoPlan,
    data: Input.DependenciasPlanInput,
  ): Promise<DependenciaActividadPlan[]>;
  reordenar(
    actor: number,
    ctx: Input.ContextoPlan,
    data: Input.OrdenPlanInput,
  ): Promise<boolean>;
  previsualizar(
    actor: number,
    ctx: Input.ContextoPlan,
    data: Input.PrevisualizarPlanInput,
  ): Promise<PrevisualizacionCronograma>;
  publicar(
    actor: number,
    ctx: Input.ContextoPlan,
    data: Input.MotivoPlanInput,
  ): Promise<ResultadoLineaBase>;
  lineaBase(
    actor: number,
    ctx: Input.ContextoPlan,
    data: Input.LineaBaseInput,
  ): Promise<ResultadoLineaBase>;
  reprogramar(
    actor: number,
    ctx: Input.ContextoPlan,
    data: Input.ReprogramarPlanInput,
  ): Promise<FechaActividadPlan[]>;
  estadoActividad(
    actor: number,
    ctx: Input.ContextoPlan,
    data: Input.EstadoActividadPlanInput,
  ): Promise<CambioEstadoActividadPlan>;
  estadoPlan(
    actor: number,
    ctx: Input.ContextoPlan,
    data: Input.EstadoPlanInput,
  ): Promise<CambioEstadoPlan>;
  historial(
    actor: number,
    ctx: Input.ContextoPlan,
    data: Input.HistorialPlanInput,
  ): Promise<PlanificacionJson>;
  ampliaciones(
    actor: number,
    ctx: Input.ContextoPlan,
    data: Input.PaginacionPlanInput,
  ): Promise<AmpliacionPlan[]>;
  resolverAmpliacion(
    actor: number,
    ctx: Input.ContextoPlan,
    data: Input.ResolverAmpliacionInput,
  ): Promise<AmpliacionPlan>;
  misAsignaciones(
    actor: number,
    trabajador: number,
    data: Input.MisAsignacionesInput,
  ): Promise<AsignacionColaboradorPlan[]>;
  estadoParte(
    actor: number,
    idAsignacion: number,
    data: Input.EstadoParteInput,
  ): Promise<CambioEstadoPartePlan>;
  solicitarAmpliacion(
    actor: number,
    idAsignacion: number,
    data: Input.SolicitarAmpliacionInput,
  ): Promise<AmpliacionPlan>;
  misAmpliaciones(
    actor: number,
    data: Input.MisAmpliacionesInput,
  ): Promise<AmpliacionPlan[]>;
}
