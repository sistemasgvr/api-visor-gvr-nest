import { Injectable, Inject } from '@nestjs/common';
import type { IProyectoRepository, ProyectoPorEstadoItem } from '../../../domain/repositories/proyecto.repository.interface';
import { PROYECTO_REPOSITORY } from '../../../domain/repositories/proyecto.repository.interface';

@Injectable()
export class ListarEstadisticasProyectosPorEstadoUseCase {
    constructor(
        @Inject(PROYECTO_REPOSITORY)
        private readonly proyectoRepository: IProyectoRepository,
    ) {}

    async execute(): Promise<ProyectoPorEstadoItem[]> {
        return this.proyectoRepository.contarProyectosPorEstado();
    }
}
