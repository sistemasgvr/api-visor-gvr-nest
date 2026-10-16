import { InvalidInputError } from '../../../errors/application.error';
import type { AutodeskAdminPort } from '../../../ports/autodesk/admin.port';

import { ImportarUsuariosProyectoDto } from '../../../inputs/acc/project-users/importar-usuarios-proyecto.dto';

export class ImportarUsuariosProyectoUseCase {
  constructor(private readonly autodeskApiService: AutodeskAdminPort) {}

  async execute(
    projectId: string,
    dto: ImportarUsuariosProyectoDto,
  ): Promise<any> {
    const token = await this.autodeskApiService.obtenerToken2Legged([
      'account:write',
    ]);

    if (this.autodeskApiService.esTokenExpirado(token.expires_at)) {
      throw new InvalidInputError(
        'El token ha expirado. Por favor, genera un nuevo token.',
      );
    }

    return await this.autodeskApiService.importarUsuariosProyecto(
      token.access_token,
      projectId,
      dto.users,
      dto.region,
      dto.user_id,
    );
  }
}
