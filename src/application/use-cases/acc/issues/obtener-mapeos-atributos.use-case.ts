import type { AutodeskIssuesPort } from '../../../ports/autodesk/issues.port';

import { ObtenerMapeosAtributosDto } from '../../../inputs/acc/issues/obtener-mapeos-atributos.dto';
import ObtenerTokenValidoHelper from './obtener-token-valido.helper';

export class ObtenerMapeosAtributosUseCase {
  constructor(
    private readonly autodeskApiService: AutodeskIssuesPort,
    private readonly obtenerTokenValidoHelper: ObtenerTokenValidoHelper,
  ) {}

  async execute(
    userId: number,
    projectId: string,
    dto: ObtenerMapeosAtributosDto,
  ): Promise<any> {
    const accessToken = await this.obtenerTokenValidoHelper.execute(userId);

    const filters: Record<string, any> = {};
    if (dto.limit) filters.limit = dto.limit.toString();
    if (dto.offset) filters.offset = dto.offset.toString();
    if (dto.sort) filters.sort = dto.sort;

    return await this.autodeskApiService.obtenerMapeosAtributos(
      accessToken,
      projectId,
      filters,
    );
  }
}
