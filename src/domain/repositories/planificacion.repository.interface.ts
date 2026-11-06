import type * as Input from '../entities/planificacion-input.entity';
import type {
  CalendarioPlan,
  AprobadorPlan,
  MiembroEquipoPlan,
  EstadoPlanProyecto,
  PlanificacionJson,
  CambioEstadoActividadPlan,
  CambioEstadoPlan,
  CambioEstadoPartePlan,
  AsignacionesColaborador,
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
  AnalisisEliminacionActividad,
  AnalisisEliminacionEntregable,
  ResultadoEliminacionActividad,
} from '../entities/planificacion.entity';
export const PLANIFICACION_REPOSITORY = 'PLANIFICACION_REPOSITORY';
export interface IPlanificacionRepository {
  obtenerCalendarioPlan(
    actor: number,
    ctx: Input.ContextoPlan,
    data: Input.CalendarioPlanInput,
  ): Promise<CalendarioPlan>;
  listarEquipoPlan(
    actor: number,
    idProyecto: number,
  ): Promise<MiembroEquipoPlan[]>;
  listarAprobadoresPlan(
    actor: number,
    idProyecto: number,
    permisoAprobacion: string,
  ): Promise<AprobadorPlan[]>;
  proyectosAsignados(actor: number): Promise<number[]>;
  listarResumenPlanes(
    actor: number,
    ids: number[],
  ): Promise<EstadoPlanProyecto[]>;
  listarEstadosPlanes(
    actor: number,
    ids: number[],
  ): Promise<EstadoPlanProyecto[]>;
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
  /** Reglas e impacto de eliminar; no escribe. */
  analizarEliminacionActividad(
    actor: number,
    ctx: Input.ContextoPlan,
  ): Promise<AnalisisEliminacionActividad>;
  eliminarActividad(
    actor: number,
    ctx: Input.ContextoPlan,
    data: Input.EliminarActividadPlanInput,
  ): Promise<ResultadoEliminacionActividad>;
  /** Reglas de eliminar un entregable, con o sin plan; no escribe. */
  analizarEliminacionEntregable(
    actor: number,
    idEntregable: number,
  ): Promise<AnalisisEliminacionEntregable>;
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
  bandejaAmpliaciones(
    actor: number,
    ctx: Input.ContextoPlan,
    data: Input.BandejaAmpliacionesInput,
  ): Promise<import('../entities/planificacion.entity').BandejaAmpliaciones>;
  ampliaciones(
    actor: number,
    ctx: Input.ContextoPlan,
    data: Input.PaginacionPlanInput,
  ): Promise<AmpliacionPlan[]>;
  previsualizarAmpliacion(
    actor: number,
    ctx: Input.ContextoPlan,
    data: Input.PrevisualizarAmpliacionInput,
  ): Promise<
    import('../entities/planificacion.entity').PrevisualizacionReanudacion
  >;
  reprogramarSaldoAmpliacion(
    actor: number,
    ctx: Input.ContextoPlan,
    data: Input.ReprogramarSaldoAmpliacionInput,
  ): Promise<import('../entities/planificacion.entity').AmpliacionPlan>;
  resolverAmpliacion(
    actor: number,
    ctx: Input.ContextoPlan,
    data: Input.ResolverAmpliacionInput,
  ): Promise<AmpliacionPlan>;
  misAsignaciones(
    actor: number,
    trabajador: number,
    data: Input.MisAsignacionesInput,
  ): Promise<AsignacionesColaborador>;
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
