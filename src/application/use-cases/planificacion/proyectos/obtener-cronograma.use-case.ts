import type { IPlanificacionRepository } from '../../../../domain/repositories/planificacion.repository.interface';
import type * as Input from '../../../inputs/planificacion/proyectos/planificacion.input';
export class ObtenerCronogramaUseCase {
  constructor(private readonly repository: IPlanificacionRepository) {}
  async execute(actor: number, ctx: Input.ContextoPlan) {
    await this.repository.comprobarPertenencia(ctx);
    return this.repository.obtenerCronograma(actor, ctx);
  }

  async recursos(actor: number, ctx: Input.ContextoPlan, inicio: string, fin?: string) {
    await this.repository.comprobarPertenencia(ctx);
    return this.repository.obtenerRecursos(actor, ctx, inicio, fin);
  }
}
