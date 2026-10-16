import type {
  IAccDocumentConfigRepository,
  UpsertFolderNamingRuleData,
} from '../../../../domain/repositories/acc-document-config.repository.interface';
import { assertSqlTableSuccess } from './acc-document-config.helpers';

export class UpsertFolderNamingRuleUseCase {
  constructor(private readonly repository: IAccDocumentConfigRepository) {}

  async execute(data: UpsertFolderNamingRuleData) {
    const result = await this.repository.upsertFolderNamingRule(data);
    return assertSqlTableSuccess(result);
  }
}
