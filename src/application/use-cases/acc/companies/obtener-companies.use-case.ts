import { InvalidInputError } from '../../../errors/application.error';
import type { AutodeskAdminPort } from '../../../ports/autodesk/admin.port';

import { ObtenerCompaniesDto } from '../../../inputs/acc/companies/obtener-companies.dto';

export class ObtenerCompaniesUseCase {
  constructor(private readonly autodeskApiService: AutodeskAdminPort) {}

  async execute(accountId: string, dto: ObtenerCompaniesDto): Promise<any> {
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
    if (dto.filter) params.filter = dto.filter;

    return await this.autodeskApiService.obtenerCompanies(
      token.access_token,
      accountId,
      params,
      dto.region,
    );
  }
}
