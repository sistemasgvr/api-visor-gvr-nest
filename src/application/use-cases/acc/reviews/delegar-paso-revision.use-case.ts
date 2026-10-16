import { InvalidInputError } from '../../../errors/application.error';
import { InternalReviewsRepository } from '../../../ports/internal-reviews.repository';

export class DelegarPasoRevisionUseCase {
  constructor(private readonly reviewsRepository: InternalReviewsRepository) {}

  async execute(
    userId: number,
    projectId: string,
    reviewId: number,
  ): Promise<{ id: number; message: string }> {
    const rows = await this.reviewsRepository.delegarPasoRevision<{
      success: boolean;
      message: string;
      id_result: number;
    }>([reviewId, projectId, userId]);

    const row = rows?.[0];
    if (!row?.success) {
      throw new InvalidInputError(row?.message ?? 'Error al delegar el paso');
    }
    return { id: row.id_result, message: row.message };
  }
}
