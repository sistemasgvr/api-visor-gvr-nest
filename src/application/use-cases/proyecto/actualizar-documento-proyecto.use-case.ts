import { Injectable, Inject } from '@nestjs/common';
import type { IProyectoRepository, ActualizarDocumentoProyectoData } from '../../../domain/repositories/proyecto.repository.interface';
import { PROYECTO_REPOSITORY } from '../../../domain/repositories/proyecto.repository.interface';

@Injectable()
export class ActualizarDocumentoProyectoUseCase {
    constructor(
        @Inject(PROYECTO_REPOSITORY)
        private readonly proyectoRepository: IProyectoRepository,
    ) {}

    async execute(idDocumento: number, data: ActualizarDocumentoProyectoData, idUsuarioModificacion: number) {
        return this.proyectoRepository.actualizarDocumentoProyecto(idDocumento, data, idUsuarioModificacion);
    }
}
