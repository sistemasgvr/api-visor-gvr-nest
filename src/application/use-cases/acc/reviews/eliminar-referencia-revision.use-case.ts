import { NotFoundError } from '../../../errors/application.error';
import { InternalReviewsRepository } from '../../../ports/internal-reviews.repository';

export class EliminarReferenciaRevisionUseCase {
  constructor(private readonly reviewsRepository: InternalReviewsRepository) {}

  async execute(
    idReferencia: number,
    userId: number,
  ): Promise<{ message: string }> {
    const rows = await this.reviewsRepository.eliminarReferenciaRevision<{
      success: boolean;
      message: string;
    }>([idReferencia, userId]);

    const row = rows?.[0];
    if (!row?.success) {
      throw new NotFoundError(row?.message ?? 'Referencia no encontrada');
    }

    return { message: row.message };
  }
}
