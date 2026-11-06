import type { IPlanificacionRepository } from '../../../../domain/repositories/planificacion.repository.interface';
import type * as Input from '../../../inputs/planificacion/proyectos/planificacion.input';
export class MisAmpliacionesUseCase {
  constructor(private readonly repository: IPlanificacionRepository) {}
  async execute(actor: number, data: Input.MisAmpliacionesInput) {
    return this.repository.misAmpliaciones(actor, data);
  }
}
