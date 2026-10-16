import type { IAccDocumentConfigRepository } from '../../../../domain/repositories/acc-document-config.repository.interface';
import { assertSqlJsonSuccess } from './acc-document-config.helpers';

export class ListarDocumentNamingStandardsUseCase {
  constructor(private readonly repository: IAccDocumentConfigRepository) {}

  async execute(projectExternalId: string) {
    const result =
      await this.repository.listarNamingStandards(projectExternalId);
    return assertSqlJsonSuccess(result).data ?? [];
  }
}
