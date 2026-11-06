import type { IPlanificacionRepository } from '../../../../domain/repositories/planificacion.repository.interface';
import type * as Input from '../../../inputs/planificacion/proyectos/planificacion.input';
export class EliminarActividadPlanUseCase {
  constructor(private readonly repository: IPlanificacionRepository) {}
  /** Las reglas viven en SQL y se vuelven a evaluar con el plan bloqueado al eliminar. */
  async analizar(actor: number, ctx: Input.ContextoPlan) {
    await this.repository.comprobarPertenencia(ctx);
    return this.repository.analizarEliminacionActividad(actor, ctx);
  }
  async execute(
    actor: number,
    ctx: Input.ContextoPlan,
    data: Input.EliminarActividadPlanInput,
  ) {
    await this.repository.comprobarPertenencia(ctx);
    return this.repository.eliminarActividad(actor, ctx, data);
  }
}
