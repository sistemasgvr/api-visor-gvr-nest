import type { IAuthRepository } from '../../../domain/repositories/auth.repository.interface';

/** La ruta exige `inicio.indicadores.ver_estadisticas_usuarios`; aquí no se decide por rol. */
export class ObtenerEstadisticasUsuariosUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  async execute(): Promise<{ total: number; conectados: number }> {
    return this.authRepository.getEstadisticasUsuarios();
  }
}
