import type { AutodeskAuthPort } from '../../ports/autodesk/auth.port';

import * as crypto from 'crypto';
import { GenerarUrlAutorizacionDto } from '../../inputs/acc/generar-url-autorizacion.dto';

export interface GenerarUrlAutorizacionResponse {
  authorization_url: string;
  state: string;
}

export class GenerarUrlAutorizacionUseCase {
  constructor(private readonly autodeskApiService: AutodeskAuthPort) {}

  async execute(
    dto: GenerarUrlAutorizacionDto,
  ): Promise<GenerarUrlAutorizacionResponse> {
    // Default scopes if not provided
    let scopes = dto.scopes || ['data:read'];

    // Filter empty scopes
    scopes = scopes.filter((scope) => scope && scope.trim() !== '');

    if (scopes.length === 0) {
      scopes = ['data:read'];
    }

    // Generate state for CSRF protection
    const state = crypto.randomBytes(16).toString('hex');

    // Generate authorization URL
    const authorizationUrl = this.autodeskApiService.generarUrlAutorizacion(
      scopes,
      state,
    );

    return {
      authorization_url: authorizationUrl,
      state: state,
    };
  }
}
