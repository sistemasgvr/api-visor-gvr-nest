import type { IPlanificacionRepository } from '../../../../domain/repositories/planificacion.repository.interface';
import type * as Input from '../../../inputs/planificacion/proyectos/planificacion.input';
export class SolicitarAmpliacionUseCase {
  constructor(private readonly repository: IPlanificacionRepository) {}
  async execute(
    actor: number,
    idAsignacion: number,
    data: Input.SolicitarAmpliacionInput,
  ) {
    return this.repository.solicitarAmpliacion(actor, idAsignacion, data);
  }
}
