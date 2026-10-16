import { InvalidInputError } from '../../../errors/application.error';
import { AgregarReferenciaRevisionDto } from '../../../inputs/acc/reviews/agregar-referencia-revision.dto';
import { InternalReviewsRepository } from '../../../ports/internal-reviews.repository';

export class AgregarReferenciaRevisionUseCase {
  constructor(private readonly reviewsRepository: InternalReviewsRepository) {}

  async execute(
    idRevision: number,
    projectId: string,
    dto: AgregarReferenciaRevisionDto,
    userId: number,
  ): Promise<{ id: number; message: string }> {
    const rows = await this.reviewsRepository.agregarReferenciaRevision<{
      success: boolean;
      message: string;
      id_result: number;
    }>([
      idRevision,
      projectId,
      dto.tipoReferencia,
      dto.idReferenciaExterna,
      dto.dominioReferencia ?? 'ACC',
      dto.versionReferencia ?? null,
      dto.notasReferencia ?? null,
      dto.urlDeepLink ?? null,
      dto.metadataJson ? JSON.stringify(dto.metadataJson) : null,
      userId,
    ]);

    const row = rows?.[0];
    if (!row?.success) {
      throw new InvalidInputError(
        row?.message ?? 'Error al agregar referencia',
      );
    }

    return { id: row.id_result, message: row.message };
  }
}
