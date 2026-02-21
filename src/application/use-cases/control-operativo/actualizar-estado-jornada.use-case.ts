import { Injectable, Inject } from '@nestjs/common';
import type { IControlOperativoRepository } from '../../../domain/repositories/control-operativo.repository.interface';
import { CONTROL_OPERATIVO_REPOSITORY } from '../../../domain/repositories/control-operativo.repository.interface';

@Injectable()
export class ActualizarEstadoJornadaUseCase {
    constructor(
        @Inject(CONTROL_OPERATIVO_REPOSITORY)
        private readonly controlOperativoRepository: IControlOperativoRepository,
    ) {}

    /**
     * Cambia el estado de una jornada (ej. Incompleto → Abierta para habilitar registro).
     * Debe ser usado por admin o rol con permiso.
     */
    async execute(params: {
        idJornada: number;
        idEstadoJornada: number;
        idUsuarioModificacion?: number;
    }): Promise<boolean> {
        const { idJornada, idEstadoJornada, idUsuarioModificacion } = params;
        if (!idJornada || !idEstadoJornada) {
            throw new Error('idJornada e idEstadoJornada son obligatorios');
        }
        return this.controlOperativoRepository.actualizarEstadoJornada(
            idJornada,
            idEstadoJornada,
            idUsuarioModificacion,
        );
    }
}
