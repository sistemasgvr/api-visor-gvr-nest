import { InvalidInputError } from '../../../errors/application.error';
import { SaltarPasoRevisionDto } from '../../../inputs/acc/reviews/saltar-paso-revision.dto';
import { InternalReviewsRepository } from '../../../ports/internal-reviews.repository';

export class SaltarPasoRevisionUseCase {
  constructor(private readonly reviewsRepository: InternalReviewsRepository) {}

  async execute(
    userId: number,
    projectId: string,
    reviewId: number,
    dto: SaltarPasoRevisionDto,
  ): Promise<{ id: number; message: string }> {
    const rows = await this.reviewsRepository.saltarPasoRevision<{
      success: boolean;
      message: string;
      id_result: number;
    }>([reviewId, projectId, userId, dto?.notas ?? null]);

    const row = rows?.[0];
    if (!row?.success) {
      throw new InvalidInputError(row?.message ?? 'Error al saltar el paso');
    }

    return { id: row.id_result, message: row.message };
  }
}
