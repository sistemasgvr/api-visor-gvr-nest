import type { IAccDocumentConfigRepository } from '../../../../domain/repositories/acc-document-config.repository.interface';
import { NotFoundError } from '../../../errors/application.error';

export class ObtenerFolderNamingRuleUseCase {
  constructor(private readonly repository: IAccDocumentConfigRepository) {}

  async execute(projectExternalId: string, folderExternalId: string) {
    const result = await this.repository.obtenerFolderNamingRule(
      projectExternalId,
      folderExternalId,
    );

    if (!result || result.success === false) {
      throw new NotFoundError(
        result?.message ?? 'Sin regla de nomenclatura para esta carpeta',
      );
    }

    return result.data ?? null;
  }
}
