import type { IAccRepository } from '../../../domain/repositories/acc.repository.interface';
import type { AutodeskAuthPort } from '../../ports/autodesk/auth.port';

export interface ObtenerMiTokenResponse {
  token_id: number;
  access_token: string;
  expires_at: Date;
  token_type: string;
  es_expirado: boolean;
}

export class ObtenerMiTokenUseCase {
  constructor(
    private readonly accRepository: IAccRepository,

    private readonly autodeskApiService: AutodeskAuthPort,
  ) {}

  /**
   * Retorna el token 3-legged del usuario o null si no tiene (aún no autorizó Autodesk).
   * Así el frontend no recibe 404 y no se confunde con "sesión inválida".
   */
  async execute(idUsuario: number): Promise<ObtenerMiTokenResponse | null> {
    const token =
      await this.accRepository.obtenerToken3LeggedPorUsuario(idUsuario);

    if (!token) {
      return null;
    }

    return {
      token_id: token.id!,
      access_token: token.tokenAcceso,
      expires_at: token.expiraEn,
      token_type: token.tipoToken,
      es_expirado: this.autodeskApiService.esTokenExpirado(token.expiraEn),
    };
  }
}
