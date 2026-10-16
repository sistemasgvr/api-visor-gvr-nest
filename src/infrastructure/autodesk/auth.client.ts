import type {
  Token2LeggedResponse,
  Token3LeggedResponse,
} from '../../application/ports/autodesk-api.port';
import { AutodeskClientBase } from './autodesk-client.base';

export class AutodeskAuthClient extends AutodeskClientBase {
  async obtenerToken2Legged(scopes: string[]): Promise<Token2LeggedResponse> {
    try {
      const scopesString = scopes.join(' ');

      // Encode credentials for Basic Auth
      const credentials = `${this.clientId}:${this.clientSecret}`;
      const encodedCredentials = Buffer.from(credentials).toString('base64');

      const response = await this.httpClient.post<any>(
        this.authUrl,
        new URLSearchParams({
          grant_type: 'client_credentials',
          scope: scopesString,
        }).toString(),
        {
          headers: {
            Authorization: `Basic ${encodedCredentials}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + response.data.expires_in);

      return {
        access_token: response.data.access_token,
        token_type: response.data.token_type,
        expires_in: response.data.expires_in,
        expires_at: expiresAt,
      };
    } catch (error: any) {
      throw new Error(
        `Error al obtener token 2-legged: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  generarUrlAutorizacion(scopes: string[], state: string): string {
    const scopesString = scopes.join(' ');

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.callbackUrl,
      scope: scopesString,
      state: state,
    });

    return `${this.authorizeUrl}?${params.toString()}`;
  }

  async intercambiarCodigoPorToken(
    code: string,
  ): Promise<Token3LeggedResponse> {
    try {
      // Encode credentials for Basic Auth
      const credentials = `${this.clientId}:${this.clientSecret}`;
      const encodedCredentials = Buffer.from(credentials).toString('base64');

      const response = await this.httpClient.post<any>(
        this.authUrl,
        new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: this.callbackUrl,
        }).toString(),
        {
          headers: {
            Authorization: `Basic ${encodedCredentials}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + response.data.expires_in);

      return {
        access_token: response.data.access_token,
        refresh_token: response.data.refresh_token,
        token_type: response.data.token_type,
        expires_in: response.data.expires_in,
        expires_at: expiresAt,
      };
    } catch (error: any) {
      throw new Error(
        `Error al intercambiar código por token: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  esTokenExpirado(expiraEn: Date | string): boolean {
    const now = new Date();
    const expirationDate = new Date(expiraEn);
    // Consider expired if less than 5 minutes remaining
    const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds
    return expirationDate.getTime() - now.getTime() < bufferTime;
  }

  async obtenerPerfilUsuarioAcc(accessToken: string): Promise<{
    userId: string;
    userName: string;
    emailId: string;
    firstName: string;
    lastName: string;
    emailVerified: boolean;
    profileImages?: any;
  }> {
    try {
      if (!accessToken) {
        throw new Error('El token de acceso es requerido');
      }

      const baseUrl =
        this.configService.get<string>('AUTODESK_API_BASE_URL') ||
        'https://developer.api.autodesk.com';
      const url = `${baseUrl}/userprofile/v1/users/@me`;

      const response = await this.httpClient.get<any>(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      });

      return response.data;
    } catch (error: any) {
      throw new Error(
        `Error al obtener perfil del usuario ACC: ${error.response?.data?.message || error.response?.data?.error || error.message}`,
      );
    }
  }
  async refrescarToken(refreshToken: string): Promise<Token3LeggedResponse> {
    const token = typeof refreshToken === 'string' ? refreshToken.trim() : '';
    if (!token) {
      throw new Error(
        'REFRESH_TOKEN_EXPIRED: No se recibió refresh token (vacío o inválido). Reautorice ACC.',
      );
    }

    try {
      // Encode credentials for Basic Auth
      const credentials = `${this.clientId}:${this.clientSecret}`;
      const encodedCredentials = Buffer.from(credentials).toString('base64');

      const response = await this.httpClient.post<any>(
        this.authUrl,
        new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: token,
        }).toString(),
        {
          headers: {
            Authorization: `Basic ${encodedCredentials}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + response.data.expires_in);

      // Autodesk rotates refresh tokens: each use invalidates the old one and returns a new one.
      // Read new refresh_token (Autodesk may use snake_case or camelCase in response).
      const rawRefresh =
        response.data?.refresh_token ?? response.data?.refreshToken;
      const newRefreshToken =
        typeof rawRefresh === 'string' && rawRefresh.trim()
          ? rawRefresh.trim()
          : undefined;
      if (!newRefreshToken) {
        this.logger.warn(
          'Autodesk refresh: response did not include refresh_token. Caller will keep existing value in DB.',
          { keys: response.data ? Object.keys(response.data) : [] },
        );
      }

      return {
        access_token: response.data.access_token,
        refresh_token: newRefreshToken,
        token_type: response.data.token_type,
        expires_in: response.data.expires_in,
        expires_at: expiresAt,
      };
    } catch (error: any) {
      // Check if the error is due to invalid or expired refresh token
      const errorData = error.response?.data;
      const statusCode = error.response?.status;

      if (statusCode === 400 && errorData?.error === 'invalid_grant') {
        // Refresh token is invalid or expired
        throw new Error(
          `REFRESH_TOKEN_EXPIRED: ${errorData.error_description || 'El refresh token es inválido o ha expirado'}`,
        );
      }

      // Other errors
      throw new Error(
        `Error al refrescar token: ${errorData?.error_description || errorData?.message || error.message}`,
      );
    }
  }
}
