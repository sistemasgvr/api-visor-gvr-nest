import { InvalidInputError } from '../../../errors/application.error';
import type { AutodeskAdminPort } from '../../../ports/autodesk/admin.port';

import { ActualizarUsuarioProyectoDto } from '../../../inputs/acc/project-users/actualizar-usuario-proyecto.dto';

export class ActualizarUsuarioProyectoUseCase {
  constructor(private readonly autodeskApiService: AutodeskAdminPort) {}

  async execute(
    projectId: string,
    projectUserId: string,
    dto: ActualizarUsuarioProyectoDto,
  ): Promise<any> {
    const token = await this.autodeskApiService.obtenerToken2Legged([
      'account:write',
    ]);

    if (this.autodeskApiService.esTokenExpirado(token.expires_at)) {
      throw new InvalidInputError(
        'El token ha expirado. Por favor, genera un nuevo token.',
      );
    }

    const userData: Record<string, any> = {};
    if (dto.companyId !== undefined) userData.companyId = dto.companyId;
    if (dto.roleIds !== undefined) userData.roleIds = dto.roleIds;
    if (dto.products !== undefined) userData.products = dto.products;

    if (Object.keys(userData).length === 0) {
      throw new InvalidInputError(
        'Debe proporcionar al menos un campo para actualizar',
      );
    }

    return await this.autodeskApiService.actualizarUsuarioProyecto(
      token.access_token,
      projectId,
      projectUserId,
      userData,
      dto.region,
      dto.user_id,
    );
  }
}
