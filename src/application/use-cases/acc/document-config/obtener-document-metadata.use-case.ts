import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { IAccDocumentConfigRepository } from '../../../../domain/repositories/acc-document-config.repository.interface';
import { ACC_DOCUMENT_CONFIG_REPOSITORY } from '../../../../domain/repositories/acc-document-config.repository.interface';

@Injectable()
export class ObtenerDocumentMetadataUseCase {
  constructor(
    @Inject(ACC_DOCUMENT_CONFIG_REPOSITORY)
    private readonly repository: IAccDocumentConfigRepository,
  ) {}

  async execute(projectExternalId: string, itemExternalId: string) {
    const result = await this.repository.obtenerMetadata(
      projectExternalId,
      itemExternalId,
    );

    if (!result || result.success === false) {
      throw new NotFoundException(
        result?.message ?? 'Metadatos no encontrados',
      );
    }

    return result.data ?? null;
  }
}
