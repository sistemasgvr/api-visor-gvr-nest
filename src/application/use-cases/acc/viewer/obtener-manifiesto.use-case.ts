import type { AutodeskAuthPort } from '../../../ports/autodesk/auth.port';

export class ObtenerManifiestoUseCase {
  constructor(private readonly autodeskApiService: AutodeskAuthPort) {}

  async execute(urn: string): Promise<any> {
    return await this.autodeskApiService.obtenerManifiesto(urn);
  }
}
