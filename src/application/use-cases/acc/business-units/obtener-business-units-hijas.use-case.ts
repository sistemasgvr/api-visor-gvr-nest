import { InvalidInputError } from '../../../errors/application.error';
import type { AutodeskAdminPort } from '../../../ports/autodesk/admin.port';

import { ObtenerBusinessUnitsHijasDto } from '../../../inputs/acc/business-units/obtener-business-units-hijas.dto';

export class ObtenerBusinessUnitsHijasUseCase {
  constructor(private readonly autodeskApiService: AutodeskAdminPort) {}

  async execute(
    accountId: string,
    dto: ObtenerBusinessUnitsHijasDto,
  ): Promise<any> {
    const token = await this.autodeskApiService.obtenerToken2Legged([
      'account:read',
    ]);

    if (this.autodeskApiService.esTokenExpirado(token.expires_at)) {
      throw new InvalidInputError(
        'El token ha expirado. Por favor, genera un nuevo token.',
      );
    }

    return await this.autodeskApiService.obtenerBusinessUnitsHijas(
      token.access_token,
      accountId,
      dto.parent_id,
      dto.region,
    );
  }
}
