import { Injectable, Inject } from '@nestjs/common';
import type {
    IControlOperativoRepository,
    CrearActividadParams,
    ActividadCreada,
} from '../../../domain/repositories/control-operativo.repository.interface';
import { CONTROL_OPERATIVO_REPOSITORY } from '../../../domain/repositories/control-operativo.repository.interface';

@Injectable()
export class CrearActividadUseCase {
    constructor(
        @Inject(CONTROL_OPERATIVO_REPOSITORY)
        private readonly controlOperativoRepository: IControlOperativoRepository,
    ) {}

    async execute(params: CrearActividadParams): Promise<ActividadCreada | null> {
        return this.controlOperativoRepository.crearActividad(params);
    }
}
