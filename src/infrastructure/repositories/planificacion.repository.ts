import { Injectable } from '@nestjs/common';
import type * as Input from '../../domain/entities/planificacion-input.entity';
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
} from '../../domain/entities/planificacion.entity';
import type { IPlanificacionRepository } from '../../domain/repositories/planificacion.repository.interface';
import { DatabaseFunctionService } from '../database/database-function.service';
import { NotFoundError } from '../../application/errors/application.error';
import { ejecutarPlanificacion } from './planificacion-errors';
@Injectable()
export class PlanificacionRepository implements IPlanificacionRepository {
  constructor(private readonly database: DatabaseFunctionService) {}
  obtenerPlan(actor: number, ctx: Input.ContextoPlan) {
    return this.call<PlanProyectoDetalle>('pla_ObtenerPlanProyecto', [
      actor,
      ctx.id,
    ]);
  }
  crearPlan(
    actor: number,
    ctx: Input.ContextoPlan,
    data: Input.CrearPlanInput,
  ) {
    return this.call<PlanProyecto>('pla_CrearPlanProyecto', [
      actor,
      ctx.id,
      data.idaprobador ?? null,
    ]);
  }
  obtenerCronograma(actor: number, ctx: Input.ContextoPlan) {
    return this.call<CronogramaProyecto>('pla_ObtenerCronogramaProyecto', [
      actor,
      ctx.idPlan,
    ]);
  }
  actualizarReglas(
    actor: number,
    ctx: Input.ContextoPlan,
    data: Input.ReglasPlanInput,
  ) {
    return this.call<PlanProyecto>('pla_ActualizarReglasPlan', [
      actor,
      ctx.idPlan,
      data.revisionPlan,
      JSON.stringify(data.reglas),
      data.motivo ?? null,
    ]);
  }
  crearActividad(
    actor: number,
    ctx: Input.ContextoPlan,
    data: Input.CrearActividadPlanInput,
  ) {
    return this.call<ActividadPlan>('pla_GuardarActividad', [
      actor,
      ctx.idPlan,
      data.revisionPlan,
      JSON.stringify(data.datos),
      null,
      null,
      data.motivo ?? null,
    ]);
  }
  obtenerActividad(actor: number, ctx: Input.ContextoPlan) {
    return this.call<ActividadPlanDetalle>('pla_ObtenerActividadPlan', [
      actor,
      ctx.idActividad,
    ]);
  }
  editarActividad(
    actor: number,
    ctx: Input.ContextoPlan,
    data: Input.EditarActividadPlanInput,
  ) {
    return this.call<ActividadPlan>('pla_GuardarActividad', [
      actor,
      ctx.idPlan,
      data.revisionPlan,
      JSON.stringify(data.datos),
      ctx.idActividad,
      data.revision,
      data.motivo ?? null,
    ]);
  }
  eliminarActividad(
    actor: number,
    ctx: Input.ContextoPlan,
    data: Input.RevisionActividadInput,
  ) {
    return this.call<boolean>('pla_EliminarActividad', [
      actor,
      ctx.idActividad,
      data.revisionPlan,
      data.revision,
      data.motivo ?? null,
    ]);
  }
  guardarAsignaciones(
    actor: number,
    ctx: Input.ContextoPlan,
    data: Input.AsignacionesPlanInput,
  ) {
    return this.call<AsignacionPlan[]>('pla_GuardarAsignacionesActividad', [
      actor,
      ctx.idActividad,
      data.revisionPlan,
      data.revisionActividad,
      JSON.stringify(data.asignaciones),
      data.motivo ?? null,
    ]);
  }
  guardarDependencias(
    actor: number,
    ctx: Input.ContextoPlan,
    data: Input.DependenciasPlanInput,
  ) {
    return this.call<DependenciaActividadPlan[]>(
      'pla_GuardarDependenciasActividad',
      [
        actor,
        ctx.idActividad,
        data.revisionPlan,
        JSON.stringify(data.dependencias),
        data.motivo ?? null,
      ],
    );
  }
  reordenar(
    actor: number,
    ctx: Input.ContextoPlan,
    data: Input.OrdenPlanInput,
  ) {
    return this.call<boolean>('pla_ReordenarCronograma', [
      actor,
      ctx.idPlan,
      data.revisionPlan,
      data.entregables,
      data.actividades,
      data.motivo ?? null,
    ]);
  }
  previsualizar(
    actor: number,
    ctx: Input.ContextoPlan,
    data: Input.PrevisualizarPlanInput,
  ) {
    return this.call<PrevisualizacionCronograma>(
      'pla_PrevisualizarCambioCronograma',
      [actor, ctx.idPlan, JSON.stringify(data.cambios)],
    );
  }
  publicar(
    actor: number,
    ctx: Input.ContextoPlan,
    data: Input.MotivoPlanInput,
  ) {
    return this.call<ResultadoLineaBase>('pla_PublicarPlanProyecto', [
      actor,
      ctx.idPlan,
      data.revisionPlan,
      data.motivo,
    ]);
  }
  lineaBase(
    actor: number,
    ctx: Input.ContextoPlan,
    data: Input.LineaBaseInput,
  ) {
    return this.call<ResultadoLineaBase>('pla_EstablecerLineaBase', [
      actor,
      ctx.idPlan,
      data.revisionPlan,
      data.nombre,
      data.motivo,
    ]);
  }
  reprogramar(
    actor: number,
    ctx: Input.ContextoPlan,
    data: Input.ReprogramarPlanInput,
  ) {
    return this.call<FechaActividadPlan[]>('pla_ReprogramarActividad', [
      actor,
      ctx.idActividad,
      data.revisionPlan,
      data.revision,
      data.fechaNoIniciarAntes ?? null,
      data.fechaNoFinalizarAntes ?? null,
      data.motivo,
    ]);
  }
  estadoActividad(
    actor: number,
    ctx: Input.ContextoPlan,
    data: Input.EstadoActividadPlanInput,
  ) {
    return this.call<CambioEstadoActividadPlan>('pla_CambiarEstadoActividad', [
      actor,
      ctx.idActividad,
      data.revisionPlan,
      data.revision,
      data.idEstadoDestino,
      data.motivo,
    ]);
  }
  estadoPlan(
    actor: number,
    ctx: Input.ContextoPlan,
    data: Input.EstadoPlanInput,
  ) {
    return this.call<CambioEstadoPlan>('pla_CambiarEstadoPlanProyecto', [
      actor,
      ctx.idPlan,
      data.revisionPlan,
      data.idEstadoDestino,
      data.motivo,
    ]);
  }
  historial(
    actor: number,
    ctx: Input.ContextoPlan,
    data: Input.HistorialPlanInput,
  ) {
    return this.call<PlanificacionJson>('pla_ConsultarHistorialPlan', [
      actor,
      ctx.idPlan,
      data.tipo,
      data.offset ?? 0,
      data.limite ?? 50,
      data.idLineaBase ?? null,
    ]);
  }
  ampliaciones(
    actor: number,
    ctx: Input.ContextoPlan,
    data: Input.PaginacionPlanInput,
  ) {
    return this.call<AmpliacionPlan[]>('pla_ListarAmpliaciones', [
      actor,
      ctx.idPlan,
      data.offset ?? 0,
      data.limite ?? 50,
    ]);
  }
  resolverAmpliacion(
    actor: number,
    ctx: Input.ContextoPlan,
    data: Input.ResolverAmpliacionInput,
  ) {
    return this.call<AmpliacionPlan>('pla_ResolverAmpliacion', [
      actor,
      ctx.idAmpliacion,
      data.minutosAprobados,
      data.resolucion,
    ]);
  }
  misAsignaciones(
    actor: number,
    trabajador: number,
    data: Input.MisAsignacionesInput,
  ) {
    return this.call<AsignacionColaboradorPlan[]>(
      'pla_ListarAsignacionesColaborador',
      [actor, trabajador, data.fecha, data.idProyecto ?? null],
    );
  }
  estadoParte(
    actor: number,
    idAsignacion: number,
    data: Input.EstadoParteInput,
  ) {
    return this.call<CambioEstadoPartePlan>('pla_CambiarEstadoAsignacion', [
      actor,
      idAsignacion,
      data.revision,
      data.idEstadoDestino,
      data.motivo,
    ]);
  }
  solicitarAmpliacion(
    actor: number,
    idAsignacion: number,
    data: Input.SolicitarAmpliacionInput,
  ) {
    return this.call<AmpliacionPlan>('pla_SolicitarAmpliacion', [
      actor,
      idAsignacion,
      data.minutos,
      data.motivo,
    ]);
  }
  misAmpliaciones(actor: number, data: Input.MisAmpliacionesInput) {
    return this.call<AmpliacionPlan[]>('pla_ListarAmpliaciones', [
      actor,
      data.idPlan,
      data.offset ?? 0,
      data.limite ?? 50,
    ]);
  }

  async comprobarPertenencia(ctx: Input.ContextoPlan) {
    if (ctx.idPlan == null) return;
    const rows = await ejecutarPlanificacion(() =>
      this.database.executeQuery<{ ok: number }>(
        `SELECT 1 AS ok FROM public.plaplanproyecto p WHERE p.id=$1 AND p.idproyecto=$2 AND p.estado=1
    AND ($3::integer IS NULL OR EXISTS(SELECT 1 FROM public.plaactividad a WHERE a.id=$3 AND a.idplan=p.id AND a.idproyecto=p.idproyecto AND a.estado=1))
    AND ($4::integer IS NULL OR EXISTS(SELECT 1 FROM public.plaampliacion q JOIN public.plaasignacion s ON s.id=q.idasignacion JOIN public.plaactividad a ON a.id=s.idactividad WHERE q.id=$4 AND a.idplan=p.id AND a.idproyecto=p.idproyecto AND q.estado=1))`,
        [ctx.idPlan, ctx.id, ctx.idActividad ?? null, ctx.idAmpliacion ?? null],
      ),
    );
    if (!rows.length)
      throw new NotFoundError({
        code: 'PLANIFICACION_NO_ENCONTRADO',
        message: 'No se encontró el recurso de planificación en el proyecto',
      });
  }
  async obtenerTrabajador(actor: number) {
    const rows = await ejecutarPlanificacion(() =>
      this.database.executeQuery<{ id: number }>(
        'SELECT id FROM public.tratrabajador WHERE idusuario=$1 AND estado=1',
        [actor],
      ),
    );
    if (rows.length !== 1)
      throw new NotFoundError('No se encontró el colaborador activo');
    return rows[0].id;
  }
  async obtenerAsignacionPropia(actor: number, id: number) {
    const rows = await ejecutarPlanificacion(() =>
      this.database.executeQuery<AsignacionContexto>(
        `SELECT s.idproyecto, s.idestadoactividad, s.idtrabajador FROM public.plaasignacion s JOIN public.tratrabajador t ON t.id=s.idtrabajador AND t.estado=1 WHERE s.id=$1 AND s.estado=1 AND t.idusuario=$2`,
        [id, actor],
      ),
    );
    if (rows.length !== 1)
      throw new NotFoundError('No se encontró la asignación propia');
    return rows[0];
  }
  async tienePlan(idProyecto: number) {
    const rows = await ejecutarPlanificacion(() =>
      this.database.executeQuery<{ id: number }>(
        'SELECT id FROM public.plaplanproyecto WHERE idproyecto=$1 AND estado=1',
        [idProyecto],
      ),
    );
    return rows.length > 0;
  }
  private async call<T>(name: string, params: unknown[]): Promise<T> {
    return ejecutarPlanificacion(async () => {
      const row = await this.database.callFunctionSingle<
        Record<string, unknown>
      >(name, params);
      const value = row?.[name];
      if (value == null) throw new Error('Respuesta de planificación ausente');
      this.validarRespuesta(name, value);
      // Copia JSON explícita: sin prototipos, filas del driver ni fechas convertidas a Date.
      return JSON.parse(JSON.stringify(value)) as T;
    });
  }
  private validarRespuesta(name: string, value: unknown) {
    const listados = [
      'pla_GuardarAsignacionesActividad',
      'pla_GuardarDependenciasActividad',
      'pla_ReprogramarActividad',
      'pla_ListarAmpliaciones',
      'pla_ListarAsignacionesColaborador',
    ];
    const booleanos = ['pla_EliminarActividad', 'pla_ReordenarCronograma'];
    const objeto =
      value !== null && typeof value === 'object' && !Array.isArray(value);
    if (
      booleanos.includes(name)
        ? typeof value !== 'boolean'
        : listados.includes(name)
          ? !Array.isArray(value)
          : name === 'pla_ConsultarHistorialPlan'
            ? !objeto && !Array.isArray(value)
            : !objeto
    )
      throw new Error('Formato de respuesta inválido');
    if (objeto) {
      const record = value as Record<string, unknown>;
      const campos: Record<string, string[]> = {
        pla_ObtenerPlanProyecto: ['idproyecto', 'plan'],
        pla_ObtenerCronogramaProyecto: [
          'plan',
          'entregables',
          'actividades',
          'asignaciones',
          'dependencias',
          'fechas',
        ],
        pla_ObtenerActividadPlan: ['actividad', 'asignaciones', 'dependencias'],
        pla_PrevisualizarCambioCronograma: [
          'revisionplan',
          'antes',
          'despues',
          'afectadas',
          'afectacapacidadotrosproyectos',
        ],
      };
      if ((campos[name] ?? []).some((key) => !(key in record)))
        throw new Error('Respuesta de planificación incompleta');
    }
  }
}
