import { Injectable, Inject } from '@nestjs/common';
import type {
  IAccDocumentConfigRepository,
  GenerarNombreDocumentoData,
} from '../../../../domain/repositories/acc-document-config.repository.interface';
import { ACC_DOCUMENT_CONFIG_REPOSITORY } from '../../../../domain/repositories/acc-document-config.repository.interface';
import { assertSqlJsonSuccess } from './acc-document-config.helpers';

@Injectable()
export class GenerarNombreDocumentoUseCase {
  constructor(
    @Inject(ACC_DOCUMENT_CONFIG_REPOSITORY)
    private readonly repository: IAccDocumentConfigRepository,
  ) {}

  async execute(data: GenerarNombreDocumentoData) {
    const result = await this.repository.generarNombreDocumento(data);
    const parsed = assertSqlJsonSuccess(result);
    return parsed.data ?? parsed;
  }
}
