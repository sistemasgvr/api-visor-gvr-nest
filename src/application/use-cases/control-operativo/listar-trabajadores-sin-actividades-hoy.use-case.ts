import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import type { IControlOperativoRepository } from '../../../domain/repositories/control-operativo.repository.interface';
import type { IAuthRepository } from '../../../domain/repositories/auth.repository.interface';
import { CONTROL_OPERATIVO_REPOSITORY } from '../../../domain/repositories/control-operativo.repository.interface';
import { AUTH_REPOSITORY } from '../../../domain/repositories/auth.repository.interface';
import type { TrabajadorSinActividadesHoyItem } from '../../../domain/repositories/control-operativo.repository.interface';

const ID_ROL_ADMINISTRADOR = 1;

@Injectable()
export class ListarTrabajadoresSinActividadesHoyUseCase {
    constructor(
        @Inject(CONTROL_OPERATIVO_REPOSITORY)
        private readonly controlOperativoRepository: IControlOperativoRepository,
        @Inject(AUTH_REPOSITORY)
        private readonly authRepository: IAuthRepository,
    ) {}

    async execute(idUsuario: number, fecha: string): Promise<TrabajadorSinActividadesHoyItem[]> {
        const perfil = await this.authRepository.obtenerPerfilUsuario(idUsuario);
        if (!perfil?.roles || !Array.isArray(perfil.roles)) {
            throw new UnauthorizedException('Solo administradores pueden ver quién no ha registrado actividades hoy');
        }
        const esAdmin = perfil.roles.some((r: { id?: number }) => r?.id === ID_ROL_ADMINISTRADOR);
        if (!esAdmin) {
            throw new UnauthorizedException('Solo administradores pueden ver quién no ha registrado actividades hoy');
        }
        return this.controlOperativoRepository.listarTrabajadoresSinActividadesHoy(fecha);
    }
}
