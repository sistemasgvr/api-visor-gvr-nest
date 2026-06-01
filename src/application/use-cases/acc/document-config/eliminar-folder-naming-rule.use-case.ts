import { Injectable, Inject } from '@nestjs/common';
import type { IAccDocumentConfigRepository } from '../../../../domain/repositories/acc-document-config.repository.interface';
import { ACC_DOCUMENT_CONFIG_REPOSITORY } from '../../../../domain/repositories/acc-document-config.repository.interface';
import { assertSqlTableSuccess } from './acc-document-config.helpers';

export interface EliminarFolderNamingRuleData {
  projectExternalId: string;
  folderExternalId: string;
  idUsuario?: number | null;
}

@Injectable()
export class EliminarFolderNamingRuleUseCase {
  constructor(
    @Inject(ACC_DOCUMENT_CONFIG_REPOSITORY)
    private readonly repository: IAccDocumentConfigRepository,
  ) {}

  async execute(data: EliminarFolderNamingRuleData) {
    const result = await this.repository.eliminarFolderNamingRule(data);
    return assertSqlTableSuccess(result);
  }
}
