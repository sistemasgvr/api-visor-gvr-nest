import type { AutodeskIssuesPort } from '../../../ports/autodesk/issues.port';

import ObtenerTokenValidoHelper from './obtener-token-valido.helper';

export class ObtenerPerfilUsuarioUseCase {
  constructor(
    private readonly autodeskApiService: AutodeskIssuesPort,
    private readonly obtenerTokenValidoHelper: ObtenerTokenValidoHelper,
  ) {}

  async execute(userId: number, projectId: string): Promise<any> {
    const accessToken = await this.obtenerTokenValidoHelper.execute(userId);
    return await this.autodeskApiService.obtenerPerfilUsuario(
      accessToken,
      projectId,
    );
  }
}
