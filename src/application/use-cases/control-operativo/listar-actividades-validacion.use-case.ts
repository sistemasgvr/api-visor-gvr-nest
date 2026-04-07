import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import type { IControlOperativoRepository } from '../../../domain/repositories/control-operativo.repository.interface';
import { CONTROL_OPERATIVO_REPOSITORY } from '../../../domain/repositories/control-operativo.repository.interface';
import type { ListarActividadesValidacionResult } from '../../../domain/repositories/control-operativo.repository.interface';
import type { IAuthRepository } from '../../../domain/repositories/auth.repository.interface';
import { AUTH_REPOSITORY } from '../../../domain/repositories/auth.repository.interface';
import { esAccesoTotalValidacionActividades } from './validacion-acceso.util';

export interface ListarActividadesValidacionInput {
    idUsuario: number;
    idTrabajadorFiltro?: number | null;
    idProyectoFiltro?: number | null;
    idEstadoActividadFiltro?: number | null;
    limit?: number;
    offset?: number;
}

@Injectable()
export class ListarActividadesValidacionUseCase {
    constructor(
        @Inject(CONTROL_OPERATIVO_REPOSITORY)
        private readonly controlOperativoRepository: IControlOperativoRepository,
        @Inject(AUTH_REPOSITORY)
        private readonly authRepository: IAuthRepository,
    ) {}

    async execute(input: ListarActividadesValidacionInput): Promise<ListarActividadesValidacionResult> {
        const perfil = await this.authRepository.obtenerPerfilUsuario(input.idUsuario);
        if (!perfil?.roles || !Array.isArray(perfil.roles)) {
            throw new UnauthorizedException('Usuario no identificado');
        }
        const rolesIds = (perfil.roles as { id?: number }[])
            .map((r) => r?.id)
            .filter((id): id is number => id != null);
        const esAdmin = esAccesoTotalValidacionActividades(rolesIds);

        const idTrabajadorSesion = await this.controlOperativoRepository.obtenerIdTrabajadorPorIdUsuario(input.idUsuario);
        if (idTrabajadorSesion == null) {
            return { data: [], totalCount: 0, totalHoras: 0, countPorAprobar: 0, countVencidas: 0 };
        }
        return this.controlOperativoRepository.listarActividadesValidacion({
            idTrabajadorSesion,
            esAdmin,
            idTrabajadorFiltro: input.idTrabajadorFiltro ?? null,
            idProyectoFiltro: input.idProyectoFiltro ?? null,
            idEstadoActividadFiltro: input.idEstadoActividadFiltro ?? null,
            limit: input.limit ?? 50,
            offset: input.offset ?? 0,
        });
    }
}
