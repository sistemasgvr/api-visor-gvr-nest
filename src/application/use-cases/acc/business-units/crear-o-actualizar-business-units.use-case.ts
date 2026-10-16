import { InvalidInputError } from '../../../errors/application.error';
import type { AutodeskAdminPort } from '../../../ports/autodesk/admin.port';

import { CrearOActualizarBusinessUnitsDto } from '../../../inputs/acc/business-units/crear-o-actualizar-business-units.dto';

export class CrearOActualizarBusinessUnitsUseCase {
  constructor(private readonly autodeskApiService: AutodeskAdminPort) {}

  async execute(
    accountId: string,
    dto: CrearOActualizarBusinessUnitsDto,
  ): Promise<any> {
    const token = await this.autodeskApiService.obtenerToken2Legged([
      'account:write',
    ]);

    if (this.autodeskApiService.esTokenExpirado(token.expires_at)) {
      throw new InvalidInputError(
        'El token ha expirado. Por favor, genera un nuevo token.',
      );
    }

    return await this.autodeskApiService.crearOActualizarBusinessUnits(
      token.access_token,
      accountId,
      dto.business_units,
      dto.region,
    );
  }
}
