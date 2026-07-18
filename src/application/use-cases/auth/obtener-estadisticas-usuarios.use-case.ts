import { Injectable, Inject, ForbiddenException } from '@nestjs/common';
import type { IAuthRepository } from '../../../domain/repositories/auth.repository.interface';
import { AUTH_REPOSITORY } from '../../../domain/repositories/auth.repository.interface';
import { ROLES_ADMIN_CONTROL_OPERATIVO } from '../../../domain/constants/auth-role.constants';

/** Roles que pueden ver estadísticas de usuarios (mismos que admin CO). */
const ROLES_ESTADISTICAS_USUARIOS = ROLES_ADMIN_CONTROL_OPERATIVO;

@Injectable()
export class ObtenerEstadisticasUsuariosUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: IAuthRepository,
  ) {}

  async execute(
    idUsuario: number,
  ): Promise<{ total: number; conectados: number }> {
    const perfil = await this.authRepository.obtenerPerfilUsuario(idUsuario);
    if (!perfil?.roles || !Array.isArray(perfil.roles)) {
      throw new ForbiddenException(
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
      throw new ForbiddenException(
        'Solo Administrador GVR, Administrador Sistema o Gerencia pueden ver las estadísticas de usuarios',
      );
    }
    return this.authRepository.getEstadisticasUsuarios();
  }
}
