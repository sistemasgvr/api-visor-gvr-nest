import { Injectable, Inject } from '@nestjs/common';
import type {
  CreateNamingStandardFromTemplateData,
  IAccDocumentConfigRepository,
} from '../../../../domain/repositories/acc-document-config.repository.interface';
import { ACC_DOCUMENT_CONFIG_REPOSITORY } from '../../../../domain/repositories/acc-document-config.repository.interface';
import { assertSqlTableSuccess } from './acc-document-config.helpers';

@Injectable()
export class CreateNamingStandardFromTemplateUseCase {
  constructor(
    @Inject(ACC_DOCUMENT_CONFIG_REPOSITORY)
    private readonly repository: IAccDocumentConfigRepository,
  ) {}

  async execute(data: CreateNamingStandardFromTemplateData) {
    const result = await this.repository.createNamingStandardFromTemplate(data);
    return assertSqlTableSuccess(result, 'id_naming');
  }
}
