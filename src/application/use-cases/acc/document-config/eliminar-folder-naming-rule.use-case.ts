import type { IAccDocumentConfigRepository } from '../../../../domain/repositories/acc-document-config.repository.interface';
import { assertSqlTableSuccess } from './acc-document-config.helpers';

export interface EliminarFolderNamingRuleData {
  projectExternalId: string;
  folderExternalId: string;
  idUsuario?: number | null;
}

export class EliminarFolderNamingRuleUseCase {
  constructor(private readonly repository: IAccDocumentConfigRepository) {}

  async execute(data: EliminarFolderNamingRuleData) {
    const result = await this.repository.eliminarFolderNamingRule(data);
    return assertSqlTableSuccess(result);
  }
}
