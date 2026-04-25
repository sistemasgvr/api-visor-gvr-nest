import { Injectable, Inject } from '@nestjs/common';
import type { IAccRepository } from '../../../domain/repositories/acc.repository.interface';
import { ACC_REPOSITORY } from '../../../domain/repositories/acc.repository.interface';
import { AutodeskApiService } from '../../../infrastructure/services/autodesk-api.service';

export interface ObtenerMiTokenResponse {
  token_id: number;
  access_token: string;
  expires_at: Date;
  token_type: string;
  es_expirado: boolean;
}

@Injectable()
export class ObtenerMiTokenUseCase {
  constructor(
    @Inject(ACC_REPOSITORY)
    private readonly accRepository: IAccRepository,
    @Inject(AutodeskApiService)
    private readonly autodeskApiService: AutodeskApiService,
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
