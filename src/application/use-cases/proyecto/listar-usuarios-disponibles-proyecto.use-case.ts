import { Injectable, Inject } from '@nestjs/common';
import type { IProyectoRepository, ListarUsuariosDisponiblesParams } from '../../../domain/repositories/proyecto.repository.interface';
import { PROYECTO_REPOSITORY } from '../../../domain/repositories/proyecto.repository.interface';

@Injectable()
export class ListarUsuariosDisponiblesProyectoUseCase {
    constructor(
        @Inject(PROYECTO_REPOSITORY)
        private readonly proyectoRepository: IProyectoRepository,
    ) {}

    async execute(params: ListarUsuariosDisponiblesParams) {
        return this.proyectoRepository.listarUsuariosDisponiblesProyecto(params);
    }
}
