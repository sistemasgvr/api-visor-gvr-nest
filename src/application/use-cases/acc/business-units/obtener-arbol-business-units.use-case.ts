import { InvalidInputError } from '../../../errors/application.error';
import type { AutodeskAdminPort } from '../../../ports/autodesk/admin.port';

import { ObtenerBusinessUnitsDto } from '../../../inputs/acc/business-units/obtener-business-units.dto';

export class ObtenerArbolBusinessUnitsUseCase {
  constructor(private readonly autodeskApiService: AutodeskAdminPort) {}

  async execute(accountId: string, dto: ObtenerBusinessUnitsDto): Promise<any> {
    const token = await this.autodeskApiService.obtenerToken2Legged([
      'account:read',
    ]);

    if (this.autodeskApiService.esTokenExpirado(token.expires_at)) {
      throw new InvalidInputError(
        'El token ha expirado. Por favor, genera un nuevo token.',
      );
    }

    return await this.autodeskApiService.obtenerArbolBusinessUnits(
      token.access_token,
      accountId,
      dto.region,
    );
  }
}
