import { Injectable, Inject } from '@nestjs/common';
import type {
    IControlOperativoRepository,
    ActualizarActividadParams,
    ActividadCreada,
} from '../../../domain/repositories/control-operativo.repository.interface';
import { CONTROL_OPERATIVO_REPOSITORY } from '../../../domain/repositories/control-operativo.repository.interface';

@Injectable()
export class ActualizarActividadUseCase {
    constructor(
        @Inject(CONTROL_OPERATIVO_REPOSITORY)
        private readonly controlOperativoRepository: IControlOperativoRepository,
    ) {}

    async execute(params: ActualizarActividadParams): Promise<ActividadCreada | null> {
        return this.controlOperativoRepository.actualizarActividad(params);
    }
}
