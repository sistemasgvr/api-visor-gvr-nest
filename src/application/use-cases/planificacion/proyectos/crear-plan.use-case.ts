import type { IPlanificacionRepository } from '../../../../domain/repositories/planificacion.repository.interface';
import type * as Input from '../../../inputs/planificacion/proyectos/planificacion.input';
import { exigirAprobadorValido } from './aprobadores-plan';
export class CrearPlanUseCase {
  constructor(private readonly repository: IPlanificacionRepository) {}
  async execute(
    actor: number,
    ctx: Input.ContextoPlan,
    data: Input.CrearPlanInput,
  ) {
    await this.repository.comprobarPertenencia(ctx);
    await exigirAprobadorValido(
      this.repository,
      actor,
      ctx.id,
      data.idaprobador,
    );
    return this.repository.crearPlan(actor, ctx, data);
  }
}
