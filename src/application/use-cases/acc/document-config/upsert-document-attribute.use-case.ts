import type {
  IAccDocumentConfigRepository,
  UpsertDocumentAttributeData,
} from '../../../../domain/repositories/acc-document-config.repository.interface';
import { assertSqlTableSuccess } from './acc-document-config.helpers';

export class UpsertDocumentAttributeUseCase {
  constructor(private readonly repository: IAccDocumentConfigRepository) {}

  async execute(data: UpsertDocumentAttributeData) {
    const result = await this.repository.upsertAttribute(data);
    return assertSqlTableSuccess(result, 'id_attribute');
  }
}
