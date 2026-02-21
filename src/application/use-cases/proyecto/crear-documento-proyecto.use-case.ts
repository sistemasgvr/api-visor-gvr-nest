import { Injectable, Inject } from '@nestjs/common';
import type { IProyectoRepository, CrearDocumentoProyectoData } from '../../../domain/repositories/proyecto.repository.interface';
import { PROYECTO_REPOSITORY } from '../../../domain/repositories/proyecto.repository.interface';

@Injectable()
export class CrearDocumentoProyectoUseCase {
    constructor(
        @Inject(PROYECTO_REPOSITORY)
        private readonly proyectoRepository: IProyectoRepository,
    ) {}

    async execute(idProyecto: number, data: CrearDocumentoProyectoData, idUsuarioCreacion: number) {
        return this.proyectoRepository.crearDocumentoProyecto(idProyecto, data, idUsuarioCreacion);
    }
}
