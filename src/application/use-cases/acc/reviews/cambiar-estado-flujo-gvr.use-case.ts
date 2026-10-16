import { InvalidInputError } from '../../../errors/application.error';
import { CambiarEstadoWorkflowDto } from '../../../inputs/acc/reviews/cambiar-estado-workflow.dto';
import { InternalReviewsRepository } from '../../../ports/internal-reviews.repository';

export class CambiarEstadoFlujoGvrUseCase {
  constructor(private readonly reviewsRepository: InternalReviewsRepository) {}

  async execute(
    projectId: string,
    workflowId: string,
    dto: CambiarEstadoWorkflowDto,
  ): Promise<{ id: string; mensaje: string }> {
    const flowId = parseInt(workflowId, 10);
    if (Number.isNaN(flowId)) {
      throw new InvalidInputError(
        'Solo se puede cambiar el estado de flujos internos GVR (id numérico).',
      );
    }

    const nombreEstado = dto.status === 'INACTIVE' ? 'Borrador' : 'Activo';

    let result: { id: number; mensaje: string }[];
    try {
      result = await this.reviewsRepository.cambiarEstadoFlujoTrabajoGvr<{
        id: number;
        mensaje: string;
      }>([projectId, flowId, nombreEstado]);
    } catch (e: any) {
      throw new InvalidInputError(
        e?.message ?? 'No se pudo cambiar el estado del flujo.',
      );
    }

    const row = result?.[0];
    if (!row?.id) {
      throw new InvalidInputError('No se pudo cambiar el estado del flujo.');
    }

    return {
      id: String(row.id),
      mensaje: row.mensaje ?? 'Estado actualizado.',
    };
  }
}
