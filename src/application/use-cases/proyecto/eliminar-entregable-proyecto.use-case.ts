import { PlanificacionAccessService } from '../../services/planificacion-access.service';
import type { IProyectoRepository } from '../../../domain/repositories/proyecto.repository.interface';
import type { IPlanificacionRepository } from '../../../domain/repositories/planificacion.repository.interface';
import {
  ForbiddenError,
  InvalidInputError,
  NotFoundError,
} from '../../errors/application.error';
import { puedeGestionarEntregable } from './entregable-acceso.helper';

export class EliminarEntregableProyectoUseCase {
  constructor(
    private readonly proyectoRepository: IProyectoRepository,
    private readonly planificacion: PlanificacionAccessService,
    private readonly planificacionRepository: IPlanificacionRepository,
  ) {}

  /** Bloqueos y revisión del plan antes de confirmar; las mismas reglas se repiten al eliminar. */
  async analizar(
    idEntregable: number,
    idUsuario: number,
    accesoTotal = false,
  ) {
    await this.autorizar(idEntregable, idUsuario, accesoTotal);
    return this.planificacionRepository.analizarEliminacionEntregable(
      idUsuario,
      idEntregable,
    );
  }

  async execute(
    idEntregable: number,
    idUsuarioModificacion: number,
    accesoTotal = false,
    revisionPlan?: number,
    motivo?: string,
  ) {
    await this.autorizar(idEntregable, idUsuarioModificacion, accesoTotal);

    const resultado = await this.proyectoRepository.eliminarEntregableProyecto(
      idEntregable,
      idUsuarioModificacion,
      revisionPlan,
      motivo,
    );

    if (!resultado?.success) {
      throw new InvalidInputError(
        resultado?.message || 'Error al eliminar el entregable',
      );
    }

    return resultado;
  }

  private async autorizar(
    idEntregable: number,
    idUsuario: number,
    accesoTotal: boolean,
  ) {
    const actual =
      await this.proyectoRepository.obtenerEntregablePorId(idEntregable);
    if (!actual) {
      throw new NotFoundError('El entregable no existe o ya fue eliminado');
    }

    await this.planificacion.editarProyectoConPlan(
      idUsuario,
      Number(actual.idproyecto),
    );

    const puede = await puedeGestionarEntregable(this.proyectoRepository, {
      entregable: actual,
      idUsuario,
      accesoTotal,
    });
    if (!puede) {
      throw new ForbiddenError(
        'No tienes permiso para eliminar este entregable',
      );
    }
  }
}
