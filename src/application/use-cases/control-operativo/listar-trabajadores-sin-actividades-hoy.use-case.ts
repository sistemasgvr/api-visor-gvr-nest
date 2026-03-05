import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import type { IControlOperativoRepository } from '../../../domain/repositories/control-operativo.repository.interface';
import type { IAuthRepository } from '../../../domain/repositories/auth.repository.interface';
import { CONTROL_OPERATIVO_REPOSITORY } from '../../../domain/repositories/control-operativo.repository.interface';
import { AUTH_REPOSITORY } from '../../../domain/repositories/auth.repository.interface';
import type { TrabajadorSinActividadesHoyItem } from '../../../domain/repositories/control-operativo.repository.interface';

export interface ListarTrabajadoresSinActividadesHoyResult {
    data: TrabajadorSinActividadesHoyItem[];
    total: number;
}

@Injectable()
export class ListarTrabajadoresSinActividadesHoyUseCase {
    constructor(
        @Inject(CONTROL_OPERATIVO_REPOSITORY)
        private readonly controlOperativoRepository: IControlOperativoRepository,
        @Inject(AUTH_REPOSITORY)
        private readonly authRepository: IAuthRepository,
    ) {}

    async execute(idUsuario: number, fecha: string, rolesAdminPermitidos: number[]): Promise<ListarTrabajadoresSinActividadesHoyResult> {
        const perfil = await this.authRepository.obtenerPerfilUsuario(idUsuario);
        if (!perfil?.roles || !Array.isArray(perfil.roles)) {
            throw new UnauthorizedException('Solo administradores pueden ver quién no ha registrado actividades hoy');
        }
        const permitidos = rolesAdminPermitidos?.length ? rolesAdminPermitidos : [1, 5, 11];
        const rolesIds = (perfil.roles as { id?: number }[]).map((r) => r?.id).filter((id): id is number => id != null);
        const esAdmin = permitidos.some((id) => rolesIds.includes(id));
        if (!esAdmin) {
            throw new UnauthorizedException('Solo administradores pueden ver quién no ha registrado actividades hoy');
        }
        const [data, total] = await Promise.all([
            this.controlOperativoRepository.listarTrabajadoresSinActividadesHoy(fecha),
            this.controlOperativoRepository.contarTrabajadoresConJornadaHoy(fecha),
        ]);
        return { data, total };
    }
}
