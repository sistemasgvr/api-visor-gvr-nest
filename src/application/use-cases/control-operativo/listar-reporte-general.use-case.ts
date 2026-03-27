import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import type { IControlOperativoRepository, ReporteGeneralResult } from '../../../domain/repositories/control-operativo.repository.interface';
import type { IAuthRepository } from '../../../domain/repositories/auth.repository.interface';
import { CONTROL_OPERATIVO_REPOSITORY } from '../../../domain/repositories/control-operativo.repository.interface';
import { AUTH_REPOSITORY } from '../../../domain/repositories/auth.repository.interface';

export interface ListarReporteGeneralInput {
    idUsuario: number;
    idTrabajador?: number | null;
    idProyecto?: number | null;
    idEstadoActividad?: number | null;
    fechaInicio?: string | null;
    fechaFin?: string | null;
    limit?: number;
    offset?: number;
    /** IDs de roles considerados admin (enviados por el front desde ROLES_ADMIN_CONTROL_OPERATIVO). */
    rolesAdminPermitidos: number[];
}

@Injectable()
export class ListarReporteGeneralUseCase {
    constructor(
        @Inject(CONTROL_OPERATIVO_REPOSITORY)
        private readonly controlOperativoRepository: IControlOperativoRepository,
        @Inject(AUTH_REPOSITORY)
        private readonly authRepository: IAuthRepository,
    ) {}

    async execute(input: ListarReporteGeneralInput): Promise<ReporteGeneralResult> {
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
        return this.controlOperativoRepository.listarReporteGeneral({
            idTrabajador: input.idTrabajador ?? null,
            idProyecto: input.idProyecto ?? null,
            idEstadoActividad: input.idEstadoActividad ?? null,
            fechaInicio: input.fechaInicio ?? null,
            fechaFin: input.fechaFin ?? null,
            limit: input.limit ?? 50,
            offset: input.offset ?? 0,
        });
    }
}
