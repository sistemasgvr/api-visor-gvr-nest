import type { AutodeskBim360Port } from '../../ports/autodesk/bim360.port';

import { ObtenerTiposIncidenciasDto } from '../../inputs/issues-bim360/obtener-tipos-incidencias.dto';
import ObtenerTokenValidoHelper from '../acc/issues/obtener-token-valido.helper';

export class ObtenerTiposIncidenciasBim360UseCase {
  constructor(
    private readonly autodeskApiService: AutodeskBim360Port,
    private readonly obtenerTokenValidoHelper: ObtenerTokenValidoHelper,
  ) {}

  async execute(
    userId: number,
    projectId: string,
    dto: ObtenerTiposIncidenciasDto,
  ): Promise<any> {
    const accessToken = await this.obtenerTokenValidoHelper.execute(userId);

    const filters: Record<string, any> = {};
    if (dto.limit) filters.limit = dto.limit.toString();
    if (dto.offset) filters.offset = dto.offset.toString();

    return await this.autodeskApiService.obtenerTiposIncidenciasBim360(
      accessToken,
      projectId,
      filters,
    );
  }
}
