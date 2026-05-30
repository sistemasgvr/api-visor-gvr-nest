import { Injectable, Inject } from '@nestjs/common';
import type {
  IAccDocumentConfigRepository,
  UpsertFolderNamingRuleData,
} from '../../../../domain/repositories/acc-document-config.repository.interface';
import { ACC_DOCUMENT_CONFIG_REPOSITORY } from '../../../../domain/repositories/acc-document-config.repository.interface';
import { assertSqlTableSuccess } from './acc-document-config.helpers';

@Injectable()
export class UpsertFolderNamingRuleUseCase {
  constructor(
    @Inject(ACC_DOCUMENT_CONFIG_REPOSITORY)
    private readonly repository: IAccDocumentConfigRepository,
  ) {}

  async execute(data: UpsertFolderNamingRuleData) {
    const result = await this.repository.upsertFolderNamingRule(data);
    return assertSqlTableSuccess(result);
  }
}
