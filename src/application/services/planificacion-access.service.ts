import type { IPlanificacionRepository } from '../../domain/repositories/planificacion.repository.interface';
import { AuthorizationService } from './authorization.service';
import { ForbiddenError } from '../errors/application.error';
import { ID_ESTADO_ACTIVIDAD_PLAN_CULMINADO } from '../../domain/constants/estado-planificacion.constants';
export class PlanificacionAccessService {
  constructor(
    private readonly repository: IPlanificacionRepository,
    private readonly authorization: AuthorizationService,
  ) {}
  async exigir(actor: number, idProyecto: number, accion: string) {
    if (
      !(await this.authorization.can(
        actor,
        `proyectos.planificacion.${accion}`,
        { type: 'gvr_project', id: String(idProyecto) },
      ))
    )
      throw new ForbiddenError(
        'No tiene permiso para modificar la planificación del proyecto',
      );
  }
  async editarProyectoConPlan(actor: number, idProyecto: number) {
    if (await this.repository.tienePlan(idProyecto))
      await this.exigir(actor, idProyecto, 'editar');
  }
  async reabrirParte(actor: number, idAsignacion: number, destino: number) {
    const parte = await this.repository.obtenerAsignacionPropia(
      actor,
      idAsignacion,
    );
    if (
      parte.idestadoactividad === ID_ESTADO_ACTIVIDAD_PLAN_CULMINADO &&
      destino !== ID_ESTADO_ACTIVIDAD_PLAN_CULMINADO
    )
      await this.exigir(actor, parte.idproyecto, 'dar_conformidad');
  }
}
