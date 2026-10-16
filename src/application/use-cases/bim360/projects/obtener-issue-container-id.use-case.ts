import { InvalidInputError } from '../../../errors/application.error';
import type { AutodeskAuthPort } from '../../../ports/autodesk/auth.port';

export class ObtenerIssueContainerIdUseCase {
  constructor(private readonly autodeskApiService: AutodeskAuthPort) {}

  async execute(accountId: string, projectId: string): Promise<any> {
    const token = await this.autodeskApiService.obtenerToken2Legged([
      'data:read',
    ]);

    if (this.autodeskApiService.esTokenExpirado(token.expires_at)) {
      throw new InvalidInputError(
        'El token ha expirado. Por favor, genera un nuevo token.',
      );
    }

    return await this.autodeskApiService.obtenerIssueContainerId(
      token.access_token,
      accountId,
      projectId,
    );
  }
}
