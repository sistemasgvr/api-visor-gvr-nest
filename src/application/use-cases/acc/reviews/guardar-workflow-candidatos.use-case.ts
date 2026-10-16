import { InternalReviewsRepository } from '../../../ports/internal-reviews.repository';

export interface WorkflowCandidatoInput {
  idUsuario: number;
  tipoPaso: 'INITIATOR' | 'REVIEWER' | 'APPROVER';
  nombrePaso: string;
  ordenPaso: number;
  esOpcional: boolean;
}

export interface GuardarWorkflowCandidatosDto {
  candidatos: WorkflowCandidatoInput[];
}

export class GuardarWorkflowCandidatosUseCase {
  constructor(private readonly reviewsRepository: InternalReviewsRepository) {}

  async execute(
    accWorkflowId: string,
    idProyectoAcc: string,
    dto: GuardarWorkflowCandidatosDto,
    idUsuarioCreacion?: number,
  ): Promise<{ success: boolean; message: string; total: number }> {
    const isGvrNumericId = /^\d+$/.test(String(accWorkflowId).trim());

    const args = isGvrNumericId
      ? [
          parseInt(String(accWorkflowId).trim(), 10),
          idProyectoAcc,
          JSON.stringify(dto.candidatos),
          idUsuarioCreacion ?? null,
        ]
      : [
          accWorkflowId,
          idProyectoAcc,
          JSON.stringify(dto.candidatos),
          idUsuarioCreacion ?? null,
        ];

    const result = await this.reviewsRepository.guardarCandidatos<{
      success: boolean;
      message: string;
      total: number;
    }>(isGvrNumericId, args);

    return result[0] ?? { success: false, message: 'Sin respuesta', total: 0 };
  }
}
