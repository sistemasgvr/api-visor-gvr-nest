import { Injectable, Inject } from '@nestjs/common';
import type { IAccDocumentConfigRepository } from '../../../../domain/repositories/acc-document-config.repository.interface';
import { ACC_DOCUMENT_CONFIG_REPOSITORY } from '../../../../domain/repositories/acc-document-config.repository.interface';
import { assertSqlJsonSuccess } from './acc-document-config.helpers';

@Injectable()
export class ListarDocumentMetadataPorCarpetaUseCase {
  constructor(
    @Inject(ACC_DOCUMENT_CONFIG_REPOSITORY)
    private readonly repository: IAccDocumentConfigRepository,
  ) {}

  async execute(projectExternalId: string, folderExternalId: string) {
    const result = await this.repository.listarMetadataPorCarpeta(
      projectExternalId,
      folderExternalId,
    );
    const parsed = assertSqlJsonSuccess(result);
    return parsed.data ?? [];
  }
}
