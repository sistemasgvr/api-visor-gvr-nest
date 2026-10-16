import { InvalidInputError } from '../../../errors/application.error';
import { EnviarResenaPasoDto } from '../../../inputs/acc/reviews/enviar-resena-paso.dto';
import { InternalReviewsRepository } from '../../../ports/internal-reviews.repository';

export class EnviarResenaPasoUseCase {
  constructor(private readonly reviewsRepository: InternalReviewsRepository) {}

  async execute(
    userId: number,
    projectId: string,
    reviewId: number,
    dto: EnviarResenaPasoDto,
  ): Promise<{ id: number; message: string }> {
    const docStatuses = dto?.docStatuses?.length
      ? JSON.stringify(
          dto.docStatuses.map((d) => ({
            idArchivo: d.idArchivo,
            estado: d.estado,
          })),
        )
      : '[]';

    const rows = await this.reviewsRepository.enviarResenaPaso<{
      success: boolean;
      message: string;
      id_result: number;
    }>([reviewId, projectId, userId, dto?.notas ?? null, docStatuses]);

    const row = rows?.[0];
    if (!row?.success) {
      throw new InvalidInputError(row?.message ?? 'Error al enviar la reseña');
    }
    return { id: row.id_result, message: row.message };
  }
}
