import { Injectable, Inject } from '@nestjs/common';
import type {
    IControlOperativoRepository,
    ProyectoAccesoTrabajador,
} from '../../../domain/repositories/control-operativo.repository.interface';
import { CONTROL_OPERATIVO_REPOSITORY } from '../../../domain/repositories/control-operativo.repository.interface';

@Injectable()
export class ListarProyectosParaValidacionUseCase {
    constructor(
        @Inject(CONTROL_OPERATIVO_REPOSITORY)
        private readonly controlOperativoRepository: IControlOperativoRepository,
    ) {}

    async execute(idTrabajador: number): Promise<ProyectoAccesoTrabajador[]> {
        if (idTrabajador == null || idTrabajador < 1) return [];
        return this.controlOperativoRepository.listarProyectosParaValidacion(idTrabajador);
    }
}
