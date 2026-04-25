import { Injectable } from '@nestjs/common';
import { AutodeskApiService } from '../../../../infrastructure/services/autodesk-api.service';
import { ObtenerApprovalStatusesDto } from '../../../dtos/acc/reviews/obtener-approval-statuses.dto';
import ObtenerTokenValidoHelper from '../issues/obtener-token-valido.helper';

@Injectable()
export class ObtenerApprovalStatusesVersionUseCase {
  constructor(
    private readonly autodeskApiService: AutodeskApiService,
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
