import { Injectable, Inject } from '@nestjs/common';
import type {
  IAccDocumentConfigRepository,
  UpsertDocumentNamingStandardData,
} from '../../../../domain/repositories/acc-document-config.repository.interface';
import { ACC_DOCUMENT_CONFIG_REPOSITORY } from '../../../../domain/repositories/acc-document-config.repository.interface';
import { assertSqlTableSuccess } from './acc-document-config.helpers';

@Injectable()
export class UpsertDocumentNamingStandardUseCase {
  constructor(
    @Inject(ACC_DOCUMENT_CONFIG_REPOSITORY)
    private readonly repository: IAccDocumentConfigRepository,
  ) {}

  async execute(data: UpsertDocumentNamingStandardData) {
    const result = await this.repository.upsertNamingStandard(data);
    return assertSqlTableSuccess(result, 'id_naming');
  }
}
