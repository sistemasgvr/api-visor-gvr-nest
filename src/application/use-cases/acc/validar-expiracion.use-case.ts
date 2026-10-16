import type { AutodeskAuthPort } from '../../ports/autodesk/auth.port';

import { ValidarExpiracionDto } from '../../inputs/acc/validar-expiracion.dto';

export interface ValidarExpiracionResponse {
  expirado: boolean;
}

export class ValidarExpiracionUseCase {
  constructor(private readonly autodeskApiService: AutodeskAuthPort) {}

  async execute(dto: ValidarExpiracionDto): Promise<ValidarExpiracionResponse> {
    const esExpirado = this.autodeskApiService.esTokenExpirado(dto.expires_at);

    return {
      expirado: esExpirado,
    };
  }
}
