import { InvalidInputError } from '../../../errors/application.error';
import type { AutodeskAdminPort } from '../../../ports/autodesk/admin.port';

import { AgregarUsuarioProyectoDto } from '../../../inputs/acc/project-users/agregar-usuario-proyecto.dto';

export class AgregarUsuarioProyectoUseCase {
  constructor(private readonly autodeskApiService: AutodeskAdminPort) {}

  async execute(
    projectId: string,
    dto: AgregarUsuarioProyectoDto,
  ): Promise<any> {
    const token = await this.autodeskApiService.obtenerToken2Legged([
      'account:write',
    ]);

    if (this.autodeskApiService.esTokenExpirado(token.expires_at)) {
      throw new InvalidInputError(
        'El token ha expirado. Por favor, genera un nuevo token.',
      );
    }

    const userData: Record<string, any> = {
      email: dto.email,
    };
    if (dto.companyId) userData.companyId = dto.companyId;
    if (dto.roleIds) userData.roleIds = dto.roleIds;
    if (dto.products) userData.products = dto.products;

    return await this.autodeskApiService.agregarUsuarioProyecto(
      token.access_token,
      projectId,
      userData,
      dto.region,
      dto.user_id,
    );
  }
}
