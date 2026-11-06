import type { IPlanificacionRepository } from '../../../../domain/repositories/planificacion.repository.interface';
import type { ContextoPlan } from '../../../inputs/planificacion/proyectos/planificacion.input';
import { PERMISO_APROBAR_AMPLIACIONES } from './aprobadores-plan';
export class ListarAprobadoresPlanUseCase {
  constructor(private readonly repository: IPlanificacionRepository) {}
  async execute(actor: number, ctx: ContextoPlan) {
    await this.repository.comprobarPertenencia(ctx);
    return this.repository.listarAprobadoresPlan(
      actor,
      ctx.id,
      PERMISO_APROBAR_AMPLIACIONES,
    );
  }
}
