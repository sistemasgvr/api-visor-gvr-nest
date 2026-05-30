import { Injectable, Inject } from '@nestjs/common';
import type {
  IAccDocumentConfigRepository,
  ListarDocumentAttributesParams,
} from '../../../../domain/repositories/acc-document-config.repository.interface';
import { ACC_DOCUMENT_CONFIG_REPOSITORY } from '../../../../domain/repositories/acc-document-config.repository.interface';

@Injectable()
export class ListarDocumentAttributesUseCase {
  constructor(
    @Inject(ACC_DOCUMENT_CONFIG_REPOSITORY)
    private readonly repository: IAccDocumentConfigRepository,
  ) {}

  async execute(params: ListarDocumentAttributesParams) {
    return this.repository.listarAttributes(params);
  }
}
