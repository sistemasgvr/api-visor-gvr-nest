import type {
  IAccDocumentConfigRepository,
  UpsertDocumentMetadataData,
} from '../../../../domain/repositories/acc-document-config.repository.interface';
import { assertSqlTableSuccess } from './acc-document-config.helpers';

export class UpsertDocumentMetadataUseCase {
  constructor(private readonly repository: IAccDocumentConfigRepository) {}

  async execute(data: UpsertDocumentMetadataData) {
    const result = await this.repository.upsertMetadata(data);
    return assertSqlTableSuccess(result, 'id_metadata');
  }
}
