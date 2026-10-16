import { InvalidInputError } from '../../../errors/application.error';
import type { AutodeskAdminPort } from '../../../ports/autodesk/admin.port';

import { ImportarCompaniesDto } from '../../../inputs/acc/companies/importar-companies.dto';

export class ImportarCompaniesUseCase {
  constructor(private readonly autodeskApiService: AutodeskAdminPort) {}

  async execute(accountId: string, dto: ImportarCompaniesDto): Promise<any> {
    const token = await this.autodeskApiService.obtenerToken2Legged([
      'account:write',
    ]);

    if (this.autodeskApiService.esTokenExpirado(token.expires_at)) {
      throw new InvalidInputError(
        'El token ha expirado. Por favor, genera un nuevo token.',
      );
    }

    return await this.autodeskApiService.importarCompanies(
      token.access_token,
      accountId,
      dto.companies,
      dto.region,
    );
  }
}
