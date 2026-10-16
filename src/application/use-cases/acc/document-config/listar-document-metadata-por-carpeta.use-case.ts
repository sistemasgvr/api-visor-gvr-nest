import type { IAccDocumentConfigRepository } from '../../../../domain/repositories/acc-document-config.repository.interface';
import { assertSqlJsonSuccess } from './acc-document-config.helpers';

export class ListarDocumentMetadataPorCarpetaUseCase {
  constructor(private readonly repository: IAccDocumentConfigRepository) {}

  async execute(projectExternalId: string, folderExternalId: string) {
    const result = await this.repository.listarMetadataPorCarpeta(
      projectExternalId,
      folderExternalId,
    );
    const parsed = assertSqlJsonSuccess(result);
    return parsed.data ?? [];
  }
}
