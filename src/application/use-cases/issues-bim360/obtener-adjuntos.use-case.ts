import type { AutodeskBim360Port } from '../../ports/autodesk/bim360.port';

import { ObtenerAdjuntosDto } from '../../inputs/issues-bim360/obtener-adjuntos.dto';
import ObtenerTokenValidoHelper from '../acc/issues/obtener-token-valido.helper';

export class ObtenerAdjuntosBim360UseCase {
  constructor(
    private readonly autodeskApiService: AutodeskBim360Port,
    private readonly obtenerTokenValidoHelper: ObtenerTokenValidoHelper,
  ) {}

  async execute(
    userId: number,
    projectId: string,
    issueId: string,
    dto: ObtenerAdjuntosDto,
  ): Promise<any> {
    const accessToken = await this.obtenerTokenValidoHelper.execute(userId);

    const filters: Record<string, any> = {};
    if (dto.limit) filters.limit = dto.limit.toString();
    if (dto.offset) filters.offset = dto.offset.toString();

    return await this.autodeskApiService.obtenerAdjuntosBim360(
      accessToken,
      projectId,
      issueId,
      filters,
    );
  }
}
