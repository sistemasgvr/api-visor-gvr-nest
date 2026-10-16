import { InvalidInputError } from '../../../errors/application.error';
import { VolverPasoAnteriorRevisionDto } from '../../../inputs/acc/reviews/volver-paso-anterior-revision.dto';
import { InternalReviewsRepository } from '../../../ports/internal-reviews.repository';

export class VolverPasoAnteriorRevisionUseCase {
  constructor(private readonly reviewsRepository: InternalReviewsRepository) {}

  async execute(
    userId: number,
    projectId: string,
    reviewId: number,
    dto: VolverPasoAnteriorRevisionDto,
  ): Promise<{ id: number; message: string }> {
    const rows = await this.reviewsRepository.volverPasoAnterior<{
      success: boolean;
      message: string;
      id_result: number;
    }>([reviewId, projectId, userId, dto?.notas ?? null]);

    const row = rows?.[0];
    if (!row?.success) {
      throw new InvalidInputError(
        row?.message ?? 'Error al volver al paso anterior',
      );
    }

    return { id: row.id_result, message: row.message };
  }
}
