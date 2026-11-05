import type { IPlanificacionRepository } from '../../../../domain/repositories/planificacion.repository.interface';
import type * as Input from '../../../inputs/planificacion/proyectos/planificacion.input';
import { exigirAprobadorValido } from './aprobadores-plan';
export class ActualizarReglasUseCase {
  constructor(private readonly repository: IPlanificacionRepository) {}
  async execute(
    actor: number,
    ctx: Input.ContextoPlan,
    data: Input.ReglasPlanInput,
  ) {
    await this.repository.comprobarPertenencia(ctx);
    if (data.reglas.idaprobador !== undefined)
      await exigirAprobadorValido(
        this.repository,
        actor,
        ctx.id,
        data.reglas.idaprobador,
      );
    return this.repository.actualizarReglas(actor, ctx, data);
  }
}
