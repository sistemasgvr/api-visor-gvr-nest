import type { IPlanificacionRepository } from '../../../../domain/repositories/planificacion.repository.interface';
import type {
  ContextoPlan,
  CalendarioPlanInput,
} from '../../../inputs/planificacion/proyectos/planificacion.input';
export class ObtenerCalendarioPlanUseCase {
  constructor(private readonly repository: IPlanificacionRepository) {}
  async execute(actor: number, ctx: ContextoPlan, data: CalendarioPlanInput) {
    await this.repository.comprobarPertenencia(ctx);
    return this.repository.obtenerCalendarioPlan(actor, ctx, data);
  }
}
