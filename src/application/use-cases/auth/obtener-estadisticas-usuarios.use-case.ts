import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import type { IAuthRepository } from '../../../domain/repositories/auth.repository.interface';
import { AUTH_REPOSITORY } from '../../../domain/repositories/auth.repository.interface';

/** IDs de roles que pueden ver estadísticas de usuarios: Administrador Sistemas, Administrador GVR, Gerencia */
const ROLES_ESTADISTICAS_USUARIOS = [1, 5, 11];

@Injectable()
export class ObtenerEstadisticasUsuariosUseCase {
    constructor(
        @Inject(AUTH_REPOSITORY)
        private readonly authRepository: IAuthRepository,
    ) {}

    async execute(idUsuario: number): Promise<{ total: number; conectados: number }> {
        const perfil = await this.authRepository.obtenerPerfilUsuario(idUsuario);
        if (!perfil?.roles || !Array.isArray(perfil.roles)) {
            throw new UnauthorizedException('Solo Administrador GVR, Administrador Sistema o Gerencia pueden ver las estadísticas de usuarios');
        }
        const rolesIds = (perfil.roles as { id?: number }[]).map((r) => r?.id).filter((id): id is number => id != null);
        const permitido = ROLES_ESTADISTICAS_USUARIOS.some((id) => rolesIds.includes(id));
        if (!permitido) {
            throw new UnauthorizedException('Solo Administrador GVR, Administrador Sistema o Gerencia pueden ver las estadísticas de usuarios');
        }
        return this.authRepository.getEstadisticasUsuarios();
    }
}
