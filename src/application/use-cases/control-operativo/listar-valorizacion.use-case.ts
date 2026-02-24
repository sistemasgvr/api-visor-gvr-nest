import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import type { IControlOperativoRepository } from '../../../domain/repositories/control-operativo.repository.interface';
import type { IAuthRepository } from '../../../domain/repositories/auth.repository.interface';
import { CONTROL_OPERATIVO_REPOSITORY } from '../../../domain/repositories/control-operativo.repository.interface';
import { AUTH_REPOSITORY } from '../../../domain/repositories/auth.repository.interface';
import type { ListarValorizacionResult } from '../../../domain/repositories/control-operativo.repository.interface';

/** ID del rol Administrador en authroles (solo ellos pueden ver Valorización). */
const ID_ROL_ADMINISTRADOR = 1;

export interface ListarValorizacionInput {
    idUsuario: number;
    idProyecto: number;
    fechaInicio: string; // YYYY-MM-DD
    fechaFin: string;    // YYYY-MM-DD
}

@Injectable()
export class ListarValorizacionUseCase {
    constructor(
        @Inject(CONTROL_OPERATIVO_REPOSITORY)
        private readonly controlOperativoRepository: IControlOperativoRepository,
        @Inject(AUTH_REPOSITORY)
        private readonly authRepository: IAuthRepository,
    ) {}

    async execute(input: ListarValorizacionInput): Promise<ListarValorizacionResult> {
        const perfil = await this.authRepository.obtenerPerfilUsuario(input.idUsuario);
        if (!perfil?.roles || !Array.isArray(perfil.roles)) {
            throw new UnauthorizedException('Solo administradores pueden acceder a la valorización');
        }
        const esAdmin = perfil.roles.some((r: { id?: number }) => r?.id === ID_ROL_ADMINISTRADOR);
        if (!esAdmin) {
            throw new UnauthorizedException('Solo administradores pueden acceder a la valorización');
        }
        return this.controlOperativoRepository.listarValorizacion({
            idProyecto: input.idProyecto,
            fechaInicio: input.fechaInicio,
            fechaFin: input.fechaFin,
        });
    }
}
