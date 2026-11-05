import type { IPlanificacionRepository } from '../../../../domain/repositories/planificacion.repository.interface';
import type * as Input from '../../../inputs/planificacion/proyectos/planificacion.input';
export class ResolverAmpliacionUseCase {
  constructor(private readonly repository: IPlanificacionRepository) {}
  async previsualizar(
    actor: number,
    ctx: Input.ContextoPlan,
    data: Input.PrevisualizarAmpliacionInput,
  ) {
    await this.repository.comprobarPertenencia(ctx);
    return this.repository.previsualizarAmpliacion(actor, ctx, data);
  }
  async reprogramar(
    actor: number,
    ctx: Input.ContextoPlan,
    data: Input.ReprogramarSaldoAmpliacionInput,
  ) {
    await this.repository.comprobarPertenencia(ctx);
    return this.repository.reprogramarSaldoAmpliacion(actor, ctx, data);
  }
  async execute(
    actor: number,
    ctx: Input.ContextoPlan,
    data: Input.ResolverAmpliacionInput,
  ) {
    await this.repository.comprobarPertenencia(ctx);
    return this.repository.resolverAmpliacion(actor, ctx, data);
  }
}
