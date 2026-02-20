import { Injectable, Inject } from '@nestjs/common';
import type {
    IControlOperativoRepository,
    ValidarActividadParams,
    ActividadCreada,
} from '../../../domain/repositories/control-operativo.repository.interface';
import { CONTROL_OPERATIVO_REPOSITORY } from '../../../domain/repositories/control-operativo.repository.interface';

export interface ValidarActividadInput {
    idActividad: number;
    idEstadoActividad: number;
    comentarioValidacion?: string | null;
    idUsuario: number;
}

@Injectable()
export class ValidarActividadUseCase {
    constructor(
        @Inject(CONTROL_OPERATIVO_REPOSITORY)
        private readonly controlOperativoRepository: IControlOperativoRepository,
    ) {}

    async execute(input: ValidarActividadInput): Promise<ActividadCreada | null> {
        const idCoordinadorRevisor = await this.controlOperativoRepository.obtenerIdTrabajadorPorIdUsuario(
            input.idUsuario,
        );
        if (idCoordinadorRevisor == null) {
            return null;
        }
        const params: ValidarActividadParams = {
            idActividad: input.idActividad,
            idEstadoActividad: input.idEstadoActividad,
            comentarioValidacion: input.comentarioValidacion ?? null,
            idCoordinadorRevisor,
            idUsuarioModificacion: input.idUsuario,
        };
        return this.controlOperativoRepository.validarActividad(params);
    }
}
