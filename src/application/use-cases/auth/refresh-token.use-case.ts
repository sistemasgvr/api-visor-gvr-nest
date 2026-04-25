import {
  Injectable,
  Inject,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { ISesionRepository } from '../../../domain/repositories/sesion.repository.interface';
import { SESION_REPOSITORY } from '../../../domain/repositories/sesion.repository.interface';
import type { IAuthRepository } from '../../../domain/repositories/auth.repository.interface';
import { AUTH_REPOSITORY } from '../../../domain/repositories/auth.repository.interface';

export interface RefreshTokenResponse {
  token: string;
  tipo_token: string;
}

/** Códigos para que el cliente trate el 401 de refresh como flujo esperado (p. ej. re-login). */
export const AUTH_REFRESH_ERROR_CODE = {
  NO_BEARER: 'AUTH_REFRESH_NO_BEARER',
  SESSION_INVALID: 'AUTH_REFRESH_SESSION_INVALID',
  TOKEN_INVALID: 'AUTH_REFRESH_TOKEN_INVALID',
  TOKEN_SESSION_MISMATCH: 'AUTH_REFRESH_TOKEN_SESSION_MISMATCH',
  TOKEN_PAYLOAD: 'AUTH_REFRESH_TOKEN_PAYLOAD',
} as const;

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    @Inject(SESION_REPOSITORY)
    private readonly sesionRepository: ISesionRepository,
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: IAuthRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async execute(
    token: string,
    ip?: string,
    userAgent?: string,
  ): Promise<RefreshTokenResponse> {
    const secret =
      this.configService.get<string>('JWT_SECRET') ||
      'default-secret-key-change-in-production';

    // La sesión en BD identifica el token actual (aunque el JWT ya haya expirado)
    const sesion = await this.sesionRepository.obtenerSesionPorToken(token);

    if (!sesion || sesion.estado !== 1) {
      throw new UnauthorizedException({
        message: 'Sesión inválida o expirada',
        code: AUTH_REFRESH_ERROR_CODE.SESSION_INVALID,
      });
    }

    let payload: { sub?: number | string; correo?: string };
    try {
      payload = await this.jwtService.verifyAsync(token, {
        secret,
        ignoreExpiration: true,
      });
    } catch {
      throw new UnauthorizedException({
        message: 'Token inválido',
        code: AUTH_REFRESH_ERROR_CODE.TOKEN_INVALID,
      });
    }

    const idUsuario =
      typeof payload.sub === 'number' ? payload.sub : Number(payload.sub);
    if (!Number.isInteger(idUsuario) || idUsuario !== sesion.idUsuario) {
      throw new UnauthorizedException({
        message: 'Token no coincide con la sesión',
        code: AUTH_REFRESH_ERROR_CODE.TOKEN_SESSION_MISMATCH,
      });
    }

    if (!payload.correo || typeof payload.correo !== 'string') {
      throw new UnauthorizedException({
        message: 'Token sin correo válido',
        code: AUTH_REFRESH_ERROR_CODE.TOKEN_PAYLOAD,
      });
    }

    const usuario = await this.authRepository.login(payload.correo);

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Generar nuevo token
    const nuevoPayload = {
      sub: usuario.id,
      correo: usuario.correo,
      nombre: usuario.nombre,
      roles: usuario.roles,
      permisos: usuario.permisos,
    };

    const nuevoToken = this.jwtService.sign(nuevoPayload);

    // Actualizar sesión con nuevo token
    await this.sesionRepository.actualizarSesion(
      sesion.id!,
      nuevoToken,
      ip,
      userAgent,
      idUsuario,
    );

    return {
      token: nuevoToken,
      tipo_token: 'Bearer',
    };
  }
}
