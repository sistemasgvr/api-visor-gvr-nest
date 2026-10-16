import { InvalidInputError } from '../../../errors/application.error';
import type { AutodeskAuthPort } from '../../../ports/autodesk/auth.port';

import { ActualizarImagenProyectoBim360Dto } from '../../../inputs/bim360/projects/actualizar-imagen-proyecto.dto';

export class ActualizarImagenProyectoBim360UseCase {
  constructor(private readonly autodeskApiService: AutodeskAuthPort) {}

  async execute(
    accountId: string,
    projectId: string,
    dto: ActualizarImagenProyectoBim360Dto,
  ): Promise<any> {
    const token = await this.autodeskApiService.obtenerToken2Legged([
      'account:write',
    ]);

    if (this.autodeskApiService.esTokenExpirado(token.expires_at)) {
      throw new InvalidInputError(
        'El token ha expirado. Por favor, genera un nuevo token.',
      );
    }

    return await this.autodeskApiService.actualizarImagenProyectoBim360(
      token.access_token,
      accountId,
      projectId,
      dto.image,
      dto.region,
    );
  }
}
