import type {
  GenerarNombreDocumentoData,
  IAccDocumentConfigRepository,
} from '../../../../domain/repositories/acc-document-config.repository.interface';
import { assertSqlJsonSuccess } from './acc-document-config.helpers';

export class GenerarNombreDocumentoUseCase {
  constructor(private readonly repository: IAccDocumentConfigRepository) {}

  async execute(data: GenerarNombreDocumentoData) {
    const result = await this.repository.generarNombreDocumento(data);
    const parsed = assertSqlJsonSuccess(result);
    return parsed.data ?? parsed;
  }
}
