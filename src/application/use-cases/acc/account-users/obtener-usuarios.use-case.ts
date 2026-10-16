import { InvalidInputError } from '../../../errors/application.error';
import type { AutodeskAdminPort } from '../../../ports/autodesk/admin.port';

import { ObtenerUsuariosDto } from '../../../inputs/acc/account-users/obtener-usuarios.dto';

export class ObtenerUsuariosUseCase {
  constructor(private readonly autodeskApiService: AutodeskAdminPort) {}

  async execute(accountId: string, dto: ObtenerUsuariosDto): Promise<any> {
    const token = await this.autodeskApiService.obtenerToken2Legged([
      'account:read',
    ]);

    if (this.autodeskApiService.esTokenExpirado(token.expires_at)) {
      throw new InvalidInputError(
        'El token ha expirado. Por favor, genera un nuevo token.',
      );
    }

    const filters: Record<string, any> = {};
    if (dto.limit) filters.limit = dto.limit.toString();
    if (dto.offset) filters.offset = dto.offset.toString();
    if (dto.sort) filters.sort = dto.sort;
    if (dto.field) filters.field = dto.field;

    return await this.autodeskApiService.obtenerUsuarios(
      token.access_token,
      accountId,
      filters,
      dto.region,
    );
  }
}
