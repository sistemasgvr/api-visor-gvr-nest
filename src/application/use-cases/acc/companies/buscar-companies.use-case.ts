import { InvalidInputError } from '../../../errors/application.error';
import type { AutodeskAdminPort } from '../../../ports/autodesk/admin.port';

import { BuscarCompaniesDto } from '../../../inputs/acc/companies/buscar-companies.dto';

export class BuscarCompaniesUseCase {
  constructor(private readonly autodeskApiService: AutodeskAdminPort) {}

  async execute(accountId: string, dto: BuscarCompaniesDto): Promise<any> {
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

    return await this.autodeskApiService.buscarCompanies(
      token.access_token,
      accountId,
      dto.term,
      params,
      dto.region,
    );
  }
}
