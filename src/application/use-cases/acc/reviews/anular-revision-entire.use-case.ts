import { InvalidInputError } from '../../../errors/application.error';
import { AnularRevisionDto } from '../../../inputs/acc/reviews/anular-revision.dto';
import { InternalReviewsRepository } from '../../../ports/internal-reviews.repository';

export class AnularRevisionEntireUseCase {
  constructor(private readonly reviewsRepository: InternalReviewsRepository) {}

  async execute(
    userId: number,
    projectId: string,
    reviewId: number,
    dto: AnularRevisionDto,
  ): Promise<{ id: number; message: string }> {
    const rows = await this.reviewsRepository.voidEntireReview<{
      success: boolean;
      message: string;
      id_result: number;
    }>([reviewId, projectId, userId, dto?.notas ?? null]);

    const row = rows?.[0];
    if (!row?.success) {
      throw new InvalidInputError(
        row?.message ?? 'Error al anular la revisión',
      );
    }

    return { id: row.id_result, message: row.message };
  }
}
