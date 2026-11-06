import type { IPlanificacionRepository } from '../../../../domain/repositories/planificacion.repository.interface';
import type * as Input from '../../../inputs/planificacion/proyectos/planificacion.input';
export class GuardarDependenciasUseCase {
  constructor(private readonly repository: IPlanificacionRepository) {}
  async execute(
    actor: number,
    ctx: Input.ContextoPlan,
    data: Input.DependenciasPlanInput,
  ) {
    await this.repository.comprobarPertenencia(ctx);
    return this.repository.guardarDependencias(actor, ctx, data);
  }
}
