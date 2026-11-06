import type { IPlanificacionRepository } from '../../../../domain/repositories/planificacion.repository.interface';
import type { AuthorizationScope } from '../../../ports/authorization.port';
import { ForbiddenError } from '../../../errors/application.error';
export class ListarEstadosPlanesUseCase {
  constructor(private readonly repository: IPlanificacionRepository) {}
  async execute(actor: number, ids: number[], alcance: AuthorizationScope, incluirResumen = false) {
    if (alcance !== 'todos' && alcance !== 'asignados')
      throw new ForbiddenError(
        'Alcance no permitido para consultar planificación',
      );
    let permitidos = [...new Set(ids)];
    if (alcance === 'asignados') {
      const asignados = new Set(
        await this.repository.proyectosAsignados(actor),
      );
      permitidos = permitidos.filter((id) => asignados.has(id));
    }
    if (!permitidos.length) return [];
    return incluirResumen
      ? this.repository.listarResumenPlanes(actor, permitidos)
      : this.repository.listarEstadosPlanes(actor, permitidos);
  }
}
