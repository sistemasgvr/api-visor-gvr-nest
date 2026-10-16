import { InvalidInputError } from '../../../errors/application.error';
import type { AutodeskAdminPort } from '../../../ports/autodesk/admin.port';

import { ObtenerCompaniesProyectoDto } from '../../../inputs/acc/companies/obtener-companies-proyecto.dto';

export class ObtenerCompaniesProyectoUseCase {
  constructor(private readonly autodeskApiService: AutodeskAdminPort) {}

  async execute(
    accountId: string,
    projectId: string,
    dto: ObtenerCompaniesProyectoDto,
  ): Promise<any> {
    const token = await this.autodeskApiService.obtenerToken2Legged([
      'account:read',
    ]);

    if (this.autodeskApiService.esTokenExpirado(token.expires_at)) {
      throw new InvalidInputError(
        'El token ha expirado. Por favor, genera un nuevo token.',
      );
    }

    const params: Record<string, any> = {};
    if (dto.limit) params.limit = dto.limit;
    if (dto.offset) params.offset = dto.offset;

    return await this.autodeskApiService.obtenerCompaniesPorProyecto(
      token.access_token,
      accountId,
      projectId,
      params,
      dto.region,
    );
  }
}
