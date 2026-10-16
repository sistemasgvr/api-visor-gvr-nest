import { ObtenerToken2LeggedDto } from '../../inputs/acc/obtener-token-2legged.dto';
import type { Token2LeggedResponse } from '../../ports/autodesk-api.port';
import type { AutodeskAuthPort } from '../../ports/autodesk/auth.port';

export class ObtenerToken2LeggedUseCase {
  constructor(private readonly autodeskApiService: AutodeskAuthPort) {}

  async execute(dto: ObtenerToken2LeggedDto): Promise<Token2LeggedResponse> {
    // Default scopes if not provided
    let scopes = dto.scopes || ['data:read'];

    // Filter empty scopes
    scopes = scopes.filter((scope) => scope && scope.trim() !== '');

    if (scopes.length === 0) {
      scopes = ['data:read'];
    }

    return await this.autodeskApiService.obtenerToken2Legged(scopes);
  }
}
