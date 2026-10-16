import { InvalidInputError } from '../../../errors/application.error';
import { AddComentarioArchivoDto } from '../../../inputs/acc/reviews/add-comentario-archivo.dto';
import { InternalReviewsRepository } from '../../../ports/internal-reviews.repository';

export class AddComentarioArchivoUseCase {
  constructor(private readonly reviewsRepository: InternalReviewsRepository) {}

  async execute(
    userId: number,
    reviewId: number,
    fileId: number,
    dto: AddComentarioArchivoDto,
  ): Promise<{ id: number; message: string }> {
    const rows = await this.reviewsRepository.addComentarioArchivoRevision<{
      success: boolean;
      message: string;
      id_result: number;
    }>([reviewId, fileId, userId, dto.contenido]);

    const row = rows?.[0];
    if (!row?.success) {
      throw new InvalidInputError(
        row?.message ?? 'Error al añadir el comentario',
      );
    }
    return { id: row.id_result, message: row.message };
  }
}
