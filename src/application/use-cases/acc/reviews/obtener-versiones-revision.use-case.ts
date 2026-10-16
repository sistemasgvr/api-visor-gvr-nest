import type { AutodeskReviewsPort } from '../../../ports/autodesk/reviews.port';

import ObtenerTokenValidoHelper from '../issues/obtener-token-valido.helper';

export class ObtenerVersionesRevisionUseCase {
  constructor(
    private readonly autodeskApiService: AutodeskReviewsPort,
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
