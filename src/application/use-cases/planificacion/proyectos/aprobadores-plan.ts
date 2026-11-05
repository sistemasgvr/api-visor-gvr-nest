import type { IPlanificacionRepository } from '../../../../domain/repositories/planificacion.repository.interface';
import {
  ForbiddenError,
  InvalidInputError,
} from '../../../errors/application.error';
import type { ContextoPlan } from '../../../inputs/planificacion/proyectos/planificacion.input';

/** Habilita candidatos adicionales al coordinador; se concede explícitamente con alcance «todos». */
export const PERMISO_APROBAR_AMPLIACIONES =
  'proyectos.planificacion.aprobar_ampliaciones';

/** Ser candidato no sustituye la designación como aprobador de un plan. */
export async function exigirAprobadorValido(
  repository: IPlanificacionRepository,
  actor: number,
  idProyecto: number,
  idAprobador: number,
) {
  const candidatos = await repository.listarAprobadoresPlan(
    actor,
    idProyecto,
    PERMISO_APROBAR_AMPLIACIONES,
  );
  if (!candidatos.some((c) => c.idtrabajador === idAprobador))
    throw new InvalidInputError(
      'El aprobador debe ser coordinador del proyecto o tener el permiso Aprobar ampliaciones con alcance Todos.',
    );
}

/** Publicar y establecer una línea base son la aprobación del Gantt vigente. */
export async function exigirAprobadorDelPlan(
  repository: IPlanificacionRepository,
  actor: number,
  ctx: ContextoPlan,
) {
  const { plan } = await repository.obtenerPlan(actor, ctx);
  const trabajador = await repository.obtenerTrabajador(actor);
  if (!plan || plan.id !== ctx.idPlan || plan.idaprobador !== trabajador)
    throw new ForbiddenError(
      'Solo el aprobador designado puede aprobar y publicar el Gantt.',
    );
  await exigirAprobadorValido(repository, actor, ctx.id, trabajador);
}
