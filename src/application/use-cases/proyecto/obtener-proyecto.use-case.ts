import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { IProyectoRepository } from '../../../domain/repositories/proyecto.repository.interface';
import { PROYECTO_REPOSITORY } from '../../../domain/repositories/proyecto.repository.interface';

@Injectable()
export class ObtenerProyectoUseCase {
    constructor(
        @Inject(PROYECTO_REPOSITORY)
        private readonly proyectoRepository: IProyectoRepository,
    ) { }

    async execute(idProyecto: number) {
        const proyecto = await this.proyectoRepository.obtenerProyectoPorId(idProyecto);

        if (!proyecto) {
            throw new NotFoundException('Proyecto no encontrado');
        }

        const [documentos, usuarios] = await Promise.all([
            this.proyectoRepository.listarDocumentosProyecto(idProyecto),
            this.proyectoRepository.listarUsuariosProyecto(idProyecto),
        ]);

        return {
            ...proyecto,
            documentos: documentos ?? [],
            usuarios: usuarios ?? [],
        };
    }
}
