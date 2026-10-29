import type { IPlanificacionRepository } from '../../../../domain/repositories/planificacion.repository.interface';
import type * as Input from '../../../inputs/planificacion/proyectos/planificacion.input';
export class MisAsignacionesUseCase {
  constructor(private readonly repository: IPlanificacionRepository) {}
  async execute(actor: number, data: Input.MisAsignacionesInput) {
    const trabajador = await this.repository.obtenerTrabajador(actor);
    return this.repository.misAsignaciones(actor, trabajador, data);
  }
  /** Asignaciones de otra persona; el alcance sobre ella lo valida el controlador. */
  deTrabajador(
    actor: number,
    idTrabajador: number,
    data: Input.MisAsignacionesInput,
  ) {
    return this.repository.misAsignaciones(actor, idTrabajador, data);
  }
}
