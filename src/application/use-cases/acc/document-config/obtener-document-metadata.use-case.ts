import type { IAccDocumentConfigRepository } from '../../../../domain/repositories/acc-document-config.repository.interface';
import { NotFoundError } from '../../../errors/application.error';

export class ObtenerDocumentMetadataUseCase {
  constructor(private readonly repository: IAccDocumentConfigRepository) {}

  async execute(projectExternalId: string, itemExternalId: string) {
    const result = await this.repository.obtenerMetadata(
      projectExternalId,
      itemExternalId,
    );

    if (!result || result.success === false) {
      throw new NotFoundError(result?.message ?? 'Metadatos no encontrados');
    }

    return result.data ?? null;
  }
}
