import type { AutodeskReviewsPort } from '../../../ports/autodesk/reviews.port';

import { ObtenerApprovalStatusesDto } from '../../../inputs/acc/reviews/obtener-approval-statuses.dto';
import ObtenerTokenValidoHelper from '../issues/obtener-token-valido.helper';

export class ObtenerApprovalStatusesVersionUseCase {
  constructor(
    private readonly autodeskApiService: AutodeskReviewsPort,
    private readonly obtenerTokenValidoHelper: ObtenerTokenValidoHelper,
  ) {}

  async execute(
    userId: number,
    projectId: string,
    versionId: string,
    dto: ObtenerApprovalStatusesDto,
  ): Promise<any> {
    const accessToken = await this.obtenerTokenValidoHelper.execute(userId);

    const filters: Record<string, any> = {};
    if (dto.limit !== undefined) filters['limit'] = dto.limit;
    if (dto.offset !== undefined) filters['offset'] = dto.offset;

    return this.autodeskApiService.obtenerApprovalStatusesVersion(
      accessToken,
      projectId,
      versionId,
      filters,
    );
  }
}
