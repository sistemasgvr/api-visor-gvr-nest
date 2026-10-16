import type { ISesionRepository } from '../../../domain/repositories/sesion.repository.interface';
import { UnauthenticatedError } from '../../errors/application.error';
import { TokenServicePort } from '../../ports/runtime.port';

export class CerrarTodasSesionesUseCase {
  constructor(
    private readonly sesionRepository: ISesionRepository,
    private readonly jwtService: TokenServicePort,
  ) {}

  async execute(token: string): Promise<void> {
    // Validar token para obtener usuario ID
    let payload: any;
    try {
      payload = this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthenticatedError('Token inválido o expirado');
    }

    const usuarioId = payload.sub;

    // Cerrar todas las sesiones del usuario
    await this.sesionRepository.cerrarTodasLasSesiones(usuarioId, usuarioId);
  }
}
