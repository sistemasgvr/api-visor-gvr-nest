import { InvalidInputError } from '../../../errors/application.error';
import type { AutodeskAuthPort } from '../../../ports/autodesk/auth.port';

import { ObtenerProyectosLegacyDto } from '../../../inputs/bim360/projects/obtener-proyectos-legacy.dto';

export class ObtenerProyectosLegacyUseCase {
  constructor(private readonly autodeskApiService: AutodeskAuthPort) {}

  async execute(
    accountId: string,
    dto: ObtenerProyectosLegacyDto,
  ): Promise<any> {
    const token = await this.autodeskApiService.obtenerToken2Legged([
      'account:read',
    ]);

    if (this.autodeskApiService.esTokenExpirado(token.expires_at)) {
      throw new InvalidInputError(
        'El token ha expirado. Por favor, genera un nuevo token.',
      );
    }

    const filters: Record<string, any> = {};
    Object.keys(dto).forEach((key) => {
      if (key !== 'region' && dto[key] !== undefined) {
        filters[key] = dto[key];
      }
    });

    return await this.autodeskApiService.obtenerProyectosLegacy(
      token.access_token,
      accountId,
      filters,
      dto.region,
    );
  }
}
