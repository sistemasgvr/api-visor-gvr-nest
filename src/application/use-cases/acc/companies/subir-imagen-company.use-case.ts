import { InvalidInputError } from '../../../errors/application.error';
import type { AutodeskAdminPort } from '../../../ports/autodesk/admin.port';
import type { UploadedFile } from '../../../ports/uploaded-file';

export class SubirImagenCompanyUseCase {
  constructor(private readonly autodeskApiService: AutodeskAdminPort) {}

  async execute(
    accountId: string,
    companyId: string,
    file: UploadedFile,
    region?: string,
  ): Promise<any> {
    const token = await this.autodeskApiService.obtenerToken2Legged([
      'account:write',
    ]);

    if (this.autodeskApiService.esTokenExpirado(token.expires_at)) {
      throw new InvalidInputError(
        'El token ha expirado. Por favor, genera un nuevo token.',
      );
    }

    return await this.autodeskApiService.subirImagenCompany(
      token.access_token,
      accountId,
      companyId,
      file,
      region,
    );
  }
}
