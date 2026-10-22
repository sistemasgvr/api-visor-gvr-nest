import type { IPlanificacionRepository } from '../../../../domain/repositories/planificacion.repository.interface';
import type * as Input from '../../../inputs/planificacion/proyectos/planificacion.input';
import { PlanificacionAccessService } from '../../../services/planificacion-access.service';
export class EstadoParteUseCase {
  constructor(
    private readonly repository: IPlanificacionRepository,
    private readonly access: PlanificacionAccessService,
  ) {}
  async execute(
    actor: number,
    idAsignacion: number,
    data: Input.EstadoParteInput,
  ) {
    await this.access.reabrirParte(actor, idAsignacion, data.idEstadoDestino);
    return this.repository.estadoParte(actor, idAsignacion, data);
  }
}
