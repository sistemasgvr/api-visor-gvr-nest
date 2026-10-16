import type { IAccRepository } from '../../../domain/repositories/acc.repository.interface';
import { InvalidInputError } from '../../errors/application.error';
import type { AutodeskAuthPort } from '../../ports/autodesk/auth.port';

import { CallbackAutorizacionDto } from '../../inputs/acc/callback-autorizacion.dto';

export interface CallbackAutorizacionResponse {
  token_id: number;
  access_token: string;
  expires_at: Date;
  token_type: string;
}

export class CallbackAutorizacionUseCase {
  constructor(
    private readonly accRepository: IAccRepository,

    private readonly autodeskApiService: AutodeskAuthPort,
  ) {}

  async execute(
    dto: CallbackAutorizacionDto,
    idUsuario: number,
  ): Promise<CallbackAutorizacionResponse> {
    if (dto.error) {
      throw new InvalidInputError(
        `Error en autorización: ${dto.error_description || dto.error}`,
      );
    }

    if (!dto.code) {
      throw new InvalidInputError('No se recibió el código de autorización');
    }

    // Note: State validation is skipped here as we don't have server-side session persistence.
    // In a stateless architecture, the client should validate the state before making the callback request
    // or we would need a distributed cache (Redis) to store states.

    // Exchange code for token
    const tokenData = await this.autodeskApiService.intercambiarCodigoPorToken(
      dto.code,
    );

    // Save token in database
    const tokenGuardado = await this.accRepository.guardarToken3Legged(
      idUsuario,
      tokenData.access_token,
      tokenData.refresh_token || null,
      tokenData.expires_at,
      tokenData.token_type,
    );

    return {
      token_id: tokenGuardado.id!,
      access_token: tokenGuardado.tokenAcceso,
      expires_at: tokenGuardado.expiraEn,
      token_type: tokenGuardado.tipoToken,
    };
  }
}
