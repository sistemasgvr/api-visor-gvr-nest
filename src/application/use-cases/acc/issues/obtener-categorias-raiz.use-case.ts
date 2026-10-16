import type { AutodeskIssuesPort } from '../../../ports/autodesk/issues.port';

import { ObtenerCategoriasRaizDto } from '../../../inputs/acc/issues/obtener-categorias-raiz.dto';
import ObtenerTokenValidoHelper from './obtener-token-valido.helper';

export class ObtenerCategoriasRaizUseCase {
  constructor(
    private readonly autodeskApiService: AutodeskIssuesPort,
    private readonly obtenerTokenValidoHelper: ObtenerTokenValidoHelper,
  ) {}

  async execute(
    userId: number,
    projectId: string,
    dto: ObtenerCategoriasRaizDto,
  ): Promise<any> {
    const accessToken = await this.obtenerTokenValidoHelper.execute(userId);

    const filters: Record<string, any> = {};
    if (dto.limit) filters.limit = dto.limit.toString();
    if (dto.offset) filters.offset = dto.offset.toString();
    if (dto.sort) filters.sort = dto.sort;

    return await this.autodeskApiService.obtenerCategoriasRaiz(
      accessToken,
      projectId,
      filters,
    );
  }
}
