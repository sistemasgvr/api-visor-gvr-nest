import { InvalidInputError } from '../../../errors/application.error';
import type { AutodeskAdminPort } from '../../../ports/autodesk/admin.port';

export class ObtenerUsuarioProyectoPorIdUseCase {
  constructor(private readonly autodeskApiService: AutodeskAdminPort) {}

  async execute(
    projectId: string,
    projectUserId: string,
    region?: string,
    userId?: string,
  ): Promise<any> {
    const token = await this.autodeskApiService.obtenerToken2Legged([
      'account:read',
    ]);

    if (this.autodeskApiService.esTokenExpirado(token.expires_at)) {
      throw new InvalidInputError(
        'El token ha expirado. Por favor, genera un nuevo token.',
      );
    }

    return await this.autodeskApiService.obtenerUsuarioProyectoPorId(
      token.access_token,
      projectId,
      projectUserId,
      region,
      userId,
    );
  }
}
