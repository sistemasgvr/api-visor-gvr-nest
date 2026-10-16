import { InvalidInputError } from '../../../errors/application.error';
import { CrearWorkflowDto } from '../../../inputs/acc/reviews/crear-workflow.dto';
import { InternalReviewsRepository } from '../../../ports/internal-reviews.repository';
import { buildFlujoRevisionPayload } from './build-flujo-revision-payload';

export interface ActualizarFlujoRevisionGvrResult {
  id: string;
  name: string;
  idProyectoAcc: string;
  mensaje: string;
}

export class ActualizarFlujoRevisionGvrUseCase {
  constructor(private readonly reviewsRepository: InternalReviewsRepository) {}

  async execute(
    userId: number,
    projectId: string,
    workflowId: string,
    dto: CrearWorkflowDto,
  ): Promise<ActualizarFlujoRevisionGvrResult> {
    const flowId = parseInt(workflowId, 10);
    if (Number.isNaN(flowId)) {
      throw new InvalidInputError(
        'Solo se pueden actualizar flujos internos GVR (id numérico).',
      );
    }

    const steps = dto.steps ?? [];
    if (steps.length === 0) {
      throw new InvalidInputError('Debe incluir al menos un paso (iniciador).');
    }

    let estadoNombre: 'Activo' | 'Borrador';
    if (dto.workflowStatus === 'ACTIVE') estadoNombre = 'Activo';
    else if (dto.workflowStatus === 'INACTIVE') estadoNombre = 'Borrador';
    else {
      const current =
        await this.reviewsRepository.obtenerFlujoTrabajoAprobacionGvrPorIdUnico<{
          status: string;
        }>([projectId, flowId]);
      if (!current) {
        throw new InvalidInputError('Flujo no encontrado.');
      }
      estadoNombre = current.status === 'INACTIVE' ? 'Borrador' : 'Activo';
    }

    const payload = buildFlujoRevisionPayload(dto, estadoNombre);

    let result: {
      id: number;
      nombre: string;
      idProyectoAcc: string;
      mensaje: string;
    }[];
    try {
      result = await this.reviewsRepository.actualizarFlujoRevision<{
        id: number;
        nombre: string;
        idProyectoAcc: string;
        mensaje: string;
      }>([projectId, userId, flowId, JSON.stringify(payload)]);
    } catch (e: any) {
      const msg = e?.message ?? String(e);
      throw new InvalidInputError(
        msg.includes('listado') ||
          msg.includes('violates') ||
          msg.includes('no encontrado')
          ? 'Error al actualizar el flujo: verifique datos y seeds de listados (acc_flujo_*).'
          : msg,
      );
    }

    const row = result?.[0];
    if (!row?.id) {
      throw new InvalidInputError(
        row?.mensaje ?? 'No se pudo actualizar el flujo de trabajo.',
      );
    }

    return {
      id: String(row.id),
      name: row.nombre ?? dto.name,
      idProyectoAcc: row.idProyectoAcc ?? projectId,
      mensaje: row.mensaje ?? 'Flujo actualizado correctamente.',
    };
  }
}
