import type { IAccRepository } from '../../../domain/repositories/acc.repository.interface';
import {
  InvalidInputError,
  NotFoundError,
} from '../../errors/application.error';
import type { AutodeskAuthPort } from '../../ports/autodesk/auth.port';

export interface RefrescarToken3LeggedResponse {
  access_token: string;
  expires_at: Date;
  token_type: string;
}

export class RefrescarToken3LeggedUseCase {
  constructor(
    private readonly accRepository: IAccRepository,

    private readonly autodeskApiService: AutodeskAuthPort,
  ) {}

  async execute(idUsuario: number): Promise<RefrescarToken3LeggedResponse> {
    // Get user's current token
    const tokenActual =
      await this.accRepository.obtenerToken3LeggedPorUsuario(idUsuario);

    if (!tokenActual) {
      throw new NotFoundError('No se encontró token activo para este usuario');
    }

    if (!tokenActual.tokenRefresco) {
      throw new InvalidInputError('No hay refresh token disponible');
    }

    try {
      // Refresh the token
      const nuevoToken = await this.autodeskApiService.refrescarToken(
        tokenActual.tokenRefresco,
      );

      // Autodesk rotates refresh tokens: save the NEW one if present; if API didn't return one, keep existing so we don't overwrite with null and break the next refresh.
      const nuevoRefresh =
        (nuevoToken.refresh_token && nuevoToken.refresh_token.trim()) ||
        tokenActual.tokenRefresco ||
        null;

      // Update token in database (access_token and expira_en always updated; token_refresco only if we have a new one)
      const tokenActualizado = await this.accRepository.actualizarToken3Legged(
        tokenActual.id!,
        nuevoToken.access_token,
        nuevoRefresh,
        nuevoToken.expires_at,
      );

      return {
        access_token: tokenActualizado.tokenAcceso,
        expires_at: tokenActualizado.expiraEn,
        token_type: tokenActualizado.tipoToken,
      };
    } catch (error: any) {
      // Check if the error is due to expired refresh token
      if (error.message && error.message.includes('REFRESH_TOKEN_EXPIRED')) {
        throw new InvalidInputError(
          'Refresh token expirado o inválido. Por favor, vuelva a autenticarse mediante el flujo OAuth.',
        );
      }

      // Re-throw other errors
      throw error;
    }
  }
}
