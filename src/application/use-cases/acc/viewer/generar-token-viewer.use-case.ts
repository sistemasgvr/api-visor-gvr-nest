import type { AutodeskAuthPort } from '../../../ports/autodesk/auth.port';

import { GenerarTokenViewerDto } from '../../../inputs/acc/viewer/generar-token-viewer.dto';

export class GenerarTokenViewerUseCase {
  constructor(private readonly autodeskApiService: AutodeskAuthPort) {}

  // El visor sólo necesita leer derivados; nunca se acepta un scope del cliente
  // (permitiría obtener tokens de escritura o de administración de la cuenta).
  async execute(_dto: GenerarTokenViewerDto): Promise<any> {
    return await this.autodeskApiService.obtenerToken2Legged([
      'viewables:read',
    ]);
  }
}
