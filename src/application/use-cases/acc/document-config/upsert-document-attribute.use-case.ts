import { Injectable, Inject } from '@nestjs/common';
import type {
  IAccDocumentConfigRepository,
  UpsertDocumentAttributeData,
} from '../../../../domain/repositories/acc-document-config.repository.interface';
import { ACC_DOCUMENT_CONFIG_REPOSITORY } from '../../../../domain/repositories/acc-document-config.repository.interface';
import { assertSqlTableSuccess } from './acc-document-config.helpers';

@Injectable()
export class UpsertDocumentAttributeUseCase {
  constructor(
    @Inject(ACC_DOCUMENT_CONFIG_REPOSITORY)
    private readonly repository: IAccDocumentConfigRepository,
  ) {}

  async execute(data: UpsertDocumentAttributeData) {
    const result = await this.repository.upsertAttribute(data);
    return assertSqlTableSuccess(result, 'id_attribute');
  }
}
