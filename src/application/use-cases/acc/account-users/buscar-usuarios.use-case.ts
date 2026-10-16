import { InvalidInputError } from '../../../errors/application.error';
import type { AutodeskAdminPort } from '../../../ports/autodesk/admin.port';

import { BuscarUsuariosDto } from '../../../inputs/acc/account-users/buscar-usuarios.dto';

export class BuscarUsuariosUseCase {
  constructor(private readonly autodeskApiService: AutodeskAdminPort) {}

  async execute(accountId: string, dto: BuscarUsuariosDto): Promise<any> {
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
    if (dto.operator) filters.operator = dto.operator;
    if (dto.partial !== undefined) filters.partial = dto.partial.toString();

    return await this.autodeskApiService.buscarUsuarios(
      token.access_token,
      accountId,
      dto.name,
      filters,
      dto.region,
    );
  }
}
