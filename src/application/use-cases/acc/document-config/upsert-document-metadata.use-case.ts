import { Injectable, Inject } from '@nestjs/common';
import type {
  IAccDocumentConfigRepository,
  UpsertDocumentMetadataData,
} from '../../../../domain/repositories/acc-document-config.repository.interface';
import { ACC_DOCUMENT_CONFIG_REPOSITORY } from '../../../../domain/repositories/acc-document-config.repository.interface';
import { assertSqlTableSuccess } from './acc-document-config.helpers';

@Injectable()
export class UpsertDocumentMetadataUseCase {
  constructor(
    @Inject(ACC_DOCUMENT_CONFIG_REPOSITORY)
    private readonly repository: IAccDocumentConfigRepository,
  ) {}

  async execute(data: UpsertDocumentMetadataData) {
    const result = await this.repository.upsertMetadata(data);
    return assertSqlTableSuccess(result, 'id_metadata');
  }
}
