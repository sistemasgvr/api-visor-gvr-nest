import { type IAccRepository } from '../../../../domain/repositories/acc.repository.interface';
import { UnauthenticatedError } from '../../../errors/application.error';
import type { AutodeskIssuesPort } from '../../../ports/autodesk/issues.port';

export default class ObtenerTokenValidoHelper {
  constructor(
    private readonly accRepository: IAccRepository,
    private readonly autodeskApiService: AutodeskIssuesPort,
  ) {}

  async execute(userId: number): Promise<string> {
    const token =
      await this.accRepository.obtenerToken3LeggedPorUsuario(userId);

    if (!token) {
      throw new UnauthenticatedError(
        'No se encontró un token de Autodesk vinculado a tu usuario. Por favor, vincula tu cuenta de Autodesk.',
      );
    }

    if (this.autodeskApiService.esTokenExpirado(token.expiraEn)) {
      if (!token.tokenRefresco) {
        throw new UnauthenticatedError(
          'El token de Autodesk ha expirado y no se puede renovar. Por favor, vuelve a vincular tu cuenta.',
        );
      }

      try {
        const nuevoToken = await this.autodeskApiService.refrescarToken(
          token.tokenRefresco,
        );

        await this.accRepository.actualizarToken3Legged(
          token.id!,
          nuevoToken.access_token,
          nuevoToken.refresh_token || token.tokenRefresco,
          nuevoToken.expires_at,
        );

        return nuevoToken.access_token;
      } catch (error: any) {
        if (error.message && error.message.includes('REFRESH_TOKEN_EXPIRED')) {
          throw new UnauthenticatedError(
            'Tu sesión de Autodesk ha expirado y no se pudo renovar. Por favor, vuelve a vincular tu cuenta.',
          );
        }
        throw new UnauthenticatedError(
          'Error al renovar el token de Autodesk. Por favor, vuelve a vincular tu cuenta.',
        );
      }
    }

    return token.tokenAcceso;
  }
}
