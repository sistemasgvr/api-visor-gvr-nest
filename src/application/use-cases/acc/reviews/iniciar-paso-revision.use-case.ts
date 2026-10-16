import { InvalidInputError } from '../../../errors/application.error';
import { InternalReviewsRepository } from '../../../ports/internal-reviews.repository';

export class IniciarPasoRevisionUseCase {
  constructor(private readonly reviewsRepository: InternalReviewsRepository) {}

  async execute(
    userId: number,
    projectId: string,
    reviewId: number,
  ): Promise<{ id: number; message: string }> {
    const rows = await this.reviewsRepository.iniciarPasoRevision<{
      success: boolean;
      message: string;
      id_result: number;
    }>([reviewId, projectId, userId]);

    const row = rows?.[0];
    if (!row?.success) {
      throw new InvalidInputError(row?.message ?? 'Error al iniciar el paso');
    }
    return { id: row.id_result, message: row.message };
  }
}
