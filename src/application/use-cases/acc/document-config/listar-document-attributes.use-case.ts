import type {
  IAccDocumentConfigRepository,
  ListarDocumentAttributesParams,
} from '../../../../domain/repositories/acc-document-config.repository.interface';

export class ListarDocumentAttributesUseCase {
  constructor(private readonly repository: IAccDocumentConfigRepository) {}

  async execute(params: ListarDocumentAttributesParams) {
    return this.repository.listarAttributes(params);
  }
}
