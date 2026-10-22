import type { IPlanificacionRepository } from '../../../../domain/repositories/planificacion.repository.interface';
import type * as Input from '../../../inputs/planificacion/proyectos/planificacion.input';
export class AmpliacionesUseCase {
  constructor(private readonly repository: IPlanificacionRepository) {}
  async execute(
    actor: number,
    ctx: Input.ContextoPlan,
    data: Input.PaginacionPlanInput,
  ) {
    await this.repository.comprobarPertenencia(ctx);
    return this.repository.ampliaciones(actor, ctx, data);
  }
}
