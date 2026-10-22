import type { IPlanificacionRepository } from '../../../../domain/repositories/planificacion.repository.interface';
import type * as Input from '../../../inputs/planificacion/proyectos/planificacion.input';
export class MisAsignacionesUseCase {
  constructor(private readonly repository: IPlanificacionRepository) {}
  async execute(actor: number, data: Input.MisAsignacionesInput) {
    const trabajador = await this.repository.obtenerTrabajador(actor);
    return this.repository.misAsignaciones(actor, trabajador, data);
  }
}
