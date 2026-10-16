import { InvalidInputError } from '../../../errors/application.error';
import type { AutodeskAdminPort } from '../../../ports/autodesk/admin.port';

import { ObtenerProyectosUsuarioDto } from '../../../inputs/acc/account-users/obtener-proyectos-usuario.dto';

export class ObtenerProyectosUsuarioUseCase {
  constructor(private readonly autodeskApiService: AutodeskAdminPort) {}

  async execute(
    accountId: string,
    userId: string,
    dto: ObtenerProyectosUsuarioDto,
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
    if (dto.limit) filters.limit = dto.limit.toString();
    if (dto.offset) filters.offset = dto.offset.toString();

    return await this.autodeskApiService.obtenerProyectosUsuario(
      token.access_token,
      accountId,
      userId,
      filters,
      dto.region,
    );
  }
}
