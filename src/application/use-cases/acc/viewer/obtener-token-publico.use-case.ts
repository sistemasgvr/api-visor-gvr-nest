import type { AutodeskAuthPort } from '../../../ports/autodesk/auth.port';

import { ObtenerTokenPublicoDto } from '../../../inputs/acc/viewer/obtener-token-publico.dto';

export class ObtenerTokenPublicoUseCase {
  constructor(private readonly autodeskApiService: AutodeskAuthPort) {}

  async execute(dto: ObtenerTokenPublicoDto): Promise<any> {
    // Token público con scope viewables:read
    return await this.autodeskApiService.obtenerToken2Legged([
      'viewables:read',
    ]);
  }
}
