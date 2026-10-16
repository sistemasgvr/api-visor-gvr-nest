import type {
  CreateNamingStandardFromTemplateData,
  IAccDocumentConfigRepository,
} from '../../../../domain/repositories/acc-document-config.repository.interface';
import { assertSqlTableSuccess } from './acc-document-config.helpers';

export class CreateNamingStandardFromTemplateUseCase {
  constructor(private readonly repository: IAccDocumentConfigRepository) {}

  async execute(data: CreateNamingStandardFromTemplateData) {
    const result = await this.repository.createNamingStandardFromTemplate(data);
    return assertSqlTableSuccess(result, 'id_naming');
  }
}
