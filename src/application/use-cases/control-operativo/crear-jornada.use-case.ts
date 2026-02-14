import { Injectable, Inject } from '@nestjs/common';
import type {
    IControlOperativoRepository,
    CrearJornadaParams,
    JornadaCreada,
} from '../../../domain/repositories/control-operativo.repository.interface';
import { CONTROL_OPERATIVO_REPOSITORY } from '../../../domain/repositories/control-operativo.repository.interface';

@Injectable()
export class CrearJornadaUseCase {
    constructor(
        @Inject(CONTROL_OPERATIVO_REPOSITORY)
        private readonly controlOperativoRepository: IControlOperativoRepository,
    ) {}

    async execute(params: CrearJornadaParams): Promise<JornadaCreada | null> {
        return this.controlOperativoRepository.crearJornada(params);
    }
}
