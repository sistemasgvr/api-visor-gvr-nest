import type { AutodeskBim360Port } from '../../ports/autodesk/bim360.port';

import ObtenerTokenValidoHelper from '../acc/issues/obtener-token-valido.helper';

export class ObtenerPerfilUsuarioBim360UseCase {
  constructor(
    private readonly autodeskApiService: AutodeskBim360Port,
    private readonly obtenerTokenValidoHelper: ObtenerTokenValidoHelper,
  ) {}

  async execute(userId: number, projectId: string): Promise<any> {
    const accessToken = await this.obtenerTokenValidoHelper.execute(userId);
    return await this.autodeskApiService.obtenerPerfilUsuarioBim360(
      accessToken,
      projectId,
    );
  }
}
