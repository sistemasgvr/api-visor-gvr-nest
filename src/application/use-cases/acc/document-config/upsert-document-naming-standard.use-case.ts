import type {
  IAccDocumentConfigRepository,
  UpsertDocumentNamingStandardData,
} from '../../../../domain/repositories/acc-document-config.repository.interface';
import { assertSqlTableSuccess } from './acc-document-config.helpers';

export class UpsertDocumentNamingStandardUseCase {
  constructor(private readonly repository: IAccDocumentConfigRepository) {}

  async execute(data: UpsertDocumentNamingStandardData) {
    const result = await this.repository.upsertNamingStandard(data);
    return assertSqlTableSuccess(result, 'id_naming');
  }
}
