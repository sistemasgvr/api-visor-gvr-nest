import { Injectable } from '@nestjs/common';
import { AutodeskApiService } from '../../../../infrastructure/services/autodesk-api.service';
import ObtenerTokenValidoHelper from '../issues/obtener-token-valido.helper';

@Injectable()
export class ObtenerVersionesRevisionUseCase {
  constructor(
    private readonly autodeskApiService: AutodeskApiService,
    private readonly obtenerTokenValidoHelper: ObtenerTokenValidoHelper,
  ) {}

  async execute(
    userId: number,
    projectId: string,
    reviewId: string,
  ): Promise<any> {
    const accessToken = await this.obtenerTokenValidoHelper.execute(userId);
    return this.autodeskApiService.obtenerVersionesRevision(
      accessToken,
      projectId,
      reviewId,
    );
  }
}
