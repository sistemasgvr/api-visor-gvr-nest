import { ROLES_ADMIN_CONTROL_OPERATIVO } from '../../../domain/constants/auth-role.constants';
import type { IAuthRepository } from '../../../domain/repositories/auth.repository.interface';
import { ForbiddenError } from '../../errors/application.error';

/** Roles que pueden ver estadísticas de usuarios (mismos que admin CO). */
const ROLES_ESTADISTICAS_USUARIOS = ROLES_ADMIN_CONTROL_OPERATIVO;

export class ObtenerEstadisticasUsuariosUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  async execute(
    idUsuario: number,
  ): Promise<{ total: number; conectados: number }> {
    const perfil = await this.authRepository.obtenerPerfilUsuario(idUsuario);
    if (!perfil?.roles || !Array.isArray(perfil.roles)) {
      throw new ForbiddenError(
        'Solo Administrador GVR, Administrador Sistema o Gerencia pueden ver las estadísticas de usuarios',
      );
    }
    const rolesIds = (perfil.roles as { id?: number }[])
      .map((r) => r?.id)
      .filter((id): id is number => id != null);
    const permitido = ROLES_ESTADISTICAS_USUARIOS.some((id) =>
      rolesIds.includes(id),
    );
    if (!permitido) {
      throw new ForbiddenError(
        'Solo Administrador GVR, Administrador Sistema o Gerencia pueden ver las estadísticas de usuarios',
      );
    }
    return this.authRepository.getEstadisticasUsuarios();
  }
}
