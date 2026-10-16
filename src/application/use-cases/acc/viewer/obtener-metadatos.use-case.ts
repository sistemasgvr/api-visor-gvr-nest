import type { AutodeskAuthPort } from '../../../ports/autodesk/auth.port';

export class ObtenerMetadatosUseCase {
  constructor(private readonly autodeskApiService: AutodeskAuthPort) {}

  async execute(urn: string): Promise<any> {
    return await this.autodeskApiService.obtenerMetadatos(urn);
  }
}
