import { InvalidInputError } from '../../../errors/application.error';
import type { AutodeskAdminPort } from '../../../ports/autodesk/admin.port';

import { ImportarUsuariosDto } from '../../../inputs/acc/account-users/importar-usuarios.dto';

export class ImportarUsuariosUseCase {
  constructor(private readonly autodeskApiService: AutodeskAdminPort) {}

  async execute(accountId: string, dto: ImportarUsuariosDto): Promise<any> {
    const token = await this.autodeskApiService.obtenerToken2Legged([
      'account:write',
    ]);

    if (this.autodeskApiService.esTokenExpirado(token.expires_at)) {
      throw new InvalidInputError(
        'El token ha expirado. Por favor, genera un nuevo token.',
      );
    }

    return await this.autodeskApiService.importarUsuarios(
      token.access_token,
      accountId,
      dto.users,
      dto.region,
    );
  }
}
