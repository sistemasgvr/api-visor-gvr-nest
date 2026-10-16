import type { AutodeskIssuesPort } from '../../../ports/autodesk/issues.port';

import { ObtenerUrlMiniaturaDto } from '../../../inputs/acc/issues/obtener-url-miniatura.dto';
import ObtenerTokenValidoHelper from './obtener-token-valido.helper';

export class ObtenerUrlMiniaturaUseCase {
  constructor(
    private readonly autodeskApiService: AutodeskIssuesPort,
    private readonly obtenerTokenValidoHelper: ObtenerTokenValidoHelper,
  ) {}

  async execute(
    userId: number,
    projectId: string,
    dto: ObtenerUrlMiniaturaDto,
  ): Promise<any> {
    const accessToken = await this.obtenerTokenValidoHelper.execute(userId);
    return await this.autodeskApiService.obtenerUrlMiniatura(
      accessToken,
      dto.snapshotUrn,
    );
  }
}
