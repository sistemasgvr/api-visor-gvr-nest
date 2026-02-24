import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import type { IControlOperativoRepository } from '../../../domain/repositories/control-operativo.repository.interface';
import type { IAuthRepository } from '../../../domain/repositories/auth.repository.interface';
import { CONTROL_OPERATIVO_REPOSITORY } from '../../../domain/repositories/control-operativo.repository.interface';
import { AUTH_REPOSITORY } from '../../../domain/repositories/auth.repository.interface';
import type { ListarDesempenoResult } from '../../../domain/repositories/control-operativo.repository.interface';

const ID_ROL_ADMINISTRADOR = 1;

export interface ListarDesempenoInput {
    idUsuario: number;
    idProyecto: number;
    fechaInicio: string;
    fechaFin: string;
}

@Injectable()
export class ListarDesempenoUseCase {
    constructor(
        @Inject(CONTROL_OPERATIVO_REPOSITORY)
        private readonly controlOperativoRepository: IControlOperativoRepository,
        @Inject(AUTH_REPOSITORY)
        private readonly authRepository: IAuthRepository,
    ) {}

    async execute(input: ListarDesempenoInput): Promise<ListarDesempenoResult> {
        const perfil = await this.authRepository.obtenerPerfilUsuario(input.idUsuario);
        if (!perfil?.roles || !Array.isArray(perfil.roles)) {
            throw new UnauthorizedException('Solo administradores pueden acceder a la evaluación de desempeño');
        }
        const esAdmin = perfil.roles.some((r: { id?: number }) => r?.id === ID_ROL_ADMINISTRADOR);
        if (!esAdmin) {
            throw new UnauthorizedException('Solo administradores pueden acceder a la evaluación de desempeño');
        }
        return this.controlOperativoRepository.listarDesempeno({
            idProyecto: input.idProyecto,
            fechaInicio: input.fechaInicio,
            fechaFin: input.fechaFin,
        });
    }
}
