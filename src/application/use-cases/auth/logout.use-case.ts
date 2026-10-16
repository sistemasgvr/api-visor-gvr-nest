import type { IAuthRepository } from '../../../domain/repositories/auth.repository.interface';
import type { ISesionRepository } from '../../../domain/repositories/sesion.repository.interface';
import { TokenServicePort } from '../../ports/runtime.port';

export class LogoutUseCase {
  constructor(
    private readonly sesionRepository: ISesionRepository,

    private readonly authRepository: IAuthRepository,
    private readonly jwtService: TokenServicePort,
  ) {}

  async execute(token: string): Promise<void> {
    // Validar token para obtener usuario ID
    let payload: any;
    try {
      payload = this.jwtService.verify(token);
    } catch (error) {
      // Si el token es inválido, no hacemos nada (ya está "cerrado")
      return;
    }

    // Obtener sesión por token
    const sesion = await this.sesionRepository.obtenerSesionPorToken(token);

    // Si existe sesión, cerrarla
    if (sesion) {
      await this.sesionRepository.cerrarSesion(sesion.id!, payload.sub);
    }

    // Marcar usuario como desconectado (isconnected = false)
    await this.authRepository.setUsuarioConectado(payload.sub, false);
  }
}
