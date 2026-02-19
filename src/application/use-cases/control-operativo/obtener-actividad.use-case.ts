import { Injectable, Inject } from '@nestjs/common';
import type {
    IControlOperativoRepository,
    ActividadDetalle,
} from '../../../domain/repositories/control-operativo.repository.interface';
import { CONTROL_OPERATIVO_REPOSITORY } from '../../../domain/repositories/control-operativo.repository.interface';

@Injectable()
export class ObtenerActividadUseCase {
    constructor(
        @Inject(CONTROL_OPERATIVO_REPOSITORY)
        private readonly controlOperativoRepository: IControlOperativoRepository,
    ) {}

    async execute(idActividad: number): Promise<ActividadDetalle | null> {
        return this.controlOperativoRepository.obtenerActividad(idActividad);
    }
}
