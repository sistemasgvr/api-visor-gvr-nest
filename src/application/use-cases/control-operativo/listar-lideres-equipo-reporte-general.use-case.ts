import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import type {
    IControlOperativoRepository,
    LiderEquipoReporteGeneralItem,
} from '../../../domain/repositories/control-operativo.repository.interface';
import type { IAuthRepository } from '../../../domain/repositories/auth.repository.interface';
import { CONTROL_OPERATIVO_REPOSITORY } from '../../../domain/repositories/control-operativo.repository.interface';
import { AUTH_REPOSITORY } from '../../../domain/repositories/auth.repository.interface';

@Injectable()
export class ListarLideresEquipoReporteGeneralUseCase {
    constructor(
        @Inject(CONTROL_OPERATIVO_REPOSITORY)
        private readonly controlOperativoRepository: IControlOperativoRepository,
        @Inject(AUTH_REPOSITORY)
        private readonly authRepository: IAuthRepository,
    ) {}

    async execute(input: { idUsuario: number; rolesAdminPermitidos: number[] }): Promise<LiderEquipoReporteGeneralItem[]> {
        const perfil = await this.authRepository.obtenerPerfilUsuario(input.idUsuario);
        if (!perfil?.roles || !Array.isArray(perfil.roles)) {
            throw new UnauthorizedException('Solo administradores pueden acceder al reporte general');
        }
        const rolesIds = (perfil.roles as { id?: number }[])
            .map((r) => r?.id)
            .filter((id): id is number => id != null);
        const permitidos = input.rolesAdminPermitidos?.length ? input.rolesAdminPermitidos : [1, 5, 11];
        const esAdmin = permitidos.some((id) => rolesIds.includes(id));
        if (!esAdmin) {
            throw new UnauthorizedException('Solo administradores pueden acceder al reporte general');
        }
        return this.controlOperativoRepository.listarLideresEquipoReporteGeneral();
    }
}
