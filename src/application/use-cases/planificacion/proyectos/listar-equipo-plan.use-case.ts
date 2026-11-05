import type { IPlanificacionRepository } from '../../../../domain/repositories/planificacion.repository.interface';
import type { ContextoPlan } from '../../../inputs/planificacion/proyectos/planificacion.input';
export class ListarEquipoPlanUseCase {
  constructor(private readonly repository: IPlanificacionRepository) {}
  async execute(actor: number, ctx: ContextoPlan) {
    await this.repository.comprobarPertenencia(ctx);
    return this.repository.listarEquipoPlan(actor, ctx.id);
  }
}
