import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { IAccDocumentConfigRepository } from '../../../../domain/repositories/acc-document-config.repository.interface';
import { ACC_DOCUMENT_CONFIG_REPOSITORY } from '../../../../domain/repositories/acc-document-config.repository.interface';

@Injectable()
export class ObtenerFolderNamingRuleUseCase {
  constructor(
    @Inject(ACC_DOCUMENT_CONFIG_REPOSITORY)
    private readonly repository: IAccDocumentConfigRepository,
  ) {}

  async execute(projectExternalId: string, folderExternalId: string) {
    const result = await this.repository.obtenerFolderNamingRule(
      projectExternalId,
      folderExternalId,
    );

    if (!result || result.success === false) {
      throw new NotFoundException(
        result?.message ?? 'Sin regla de nomenclatura para esta carpeta',
      );
    }

    return result.data ?? null;
  }
}
