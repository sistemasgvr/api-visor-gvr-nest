import { InternalReviewsRepository } from '../../../ports/internal-reviews.repository';

export interface WorkflowCandidatoRow {
  id: number;
  accWorkflowId: string;
  idUsuario: number;
  nombreUsuario: string;
  correoUsuario: string;
  tipoPaso: string;
  nombrePaso: string;
  ordenPaso: number;
  esOpcional: boolean;
}

export class ObtenerWorkflowCandidatosUseCase {
  constructor(private readonly reviewsRepository: InternalReviewsRepository) {}

  async execute(
    accWorkflowId: string,
    idProyectoAcc?: string,
  ): Promise<WorkflowCandidatoRow[]> {
    const isGvrNumericId = /^\d+$/.test(String(accWorkflowId).trim());
    if (isGvrNumericId) {
      return this.reviewsRepository.listarCandidatosFlujoTrabajoGvr<WorkflowCandidatoRow>(
        [parseInt(String(accWorkflowId).trim(), 10)],
      );
    }
    return this.reviewsRepository.listarWorkflowCandidatos<WorkflowCandidatoRow>(
      [accWorkflowId, idProyectoAcc ?? null],
    );
  }
}
