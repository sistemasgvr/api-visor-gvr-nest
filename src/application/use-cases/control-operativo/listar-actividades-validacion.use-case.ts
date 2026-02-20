import { Injectable, Inject } from '@nestjs/common';
import type { IControlOperativoRepository } from '../../../domain/repositories/control-operativo.repository.interface';
import { CONTROL_OPERATIVO_REPOSITORY } from '../../../domain/repositories/control-operativo.repository.interface';
import type { ListarActividadesValidacionResult } from '../../../domain/repositories/control-operativo.repository.interface';

export interface ListarActividadesValidacionInput {
    idUsuario: number;
    /** Indica si el usuario es administrador (ve todas las actividades). Lo calcula el front. */
    esAdmin: boolean;
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
    ) {}

    async execute(input: ListarActividadesValidacionInput): Promise<ListarActividadesValidacionResult> {
        const { idUsuario, esAdmin } = input;

        const idTrabajadorSesion = await this.controlOperativoRepository.obtenerIdTrabajadorPorIdUsuario(idUsuario);
        if (idTrabajadorSesion == null) {
            return { data: [], totalCount: 0, totalHoras: 0 };
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
