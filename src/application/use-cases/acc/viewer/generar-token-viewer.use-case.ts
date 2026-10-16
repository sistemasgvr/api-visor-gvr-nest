import type { AutodeskAuthPort } from '../../../ports/autodesk/auth.port';

import { GenerarTokenViewerDto } from '../../../inputs/acc/viewer/generar-token-viewer.dto';

export class GenerarTokenViewerUseCase {
  constructor(private readonly autodeskApiService: AutodeskAuthPort) {}

  async execute(dto: GenerarTokenViewerDto): Promise<any> {
    const scope = dto.scope || 'viewables:read';
    return await this.autodeskApiService.obtenerToken2Legged([scope]);
  }
}
