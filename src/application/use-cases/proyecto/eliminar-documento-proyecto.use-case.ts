import { Injectable, Inject } from '@nestjs/common';
import type { IProyectoRepository } from '../../../domain/repositories/proyecto.repository.interface';
import { PROYECTO_REPOSITORY } from '../../../domain/repositories/proyecto.repository.interface';

@Injectable()
export class EliminarDocumentoProyectoUseCase {
    constructor(
        @Inject(PROYECTO_REPOSITORY)
        private readonly proyectoRepository: IProyectoRepository,
    ) {}

    async execute(idDocumento: number, idUsuarioModificacion: number) {
        return this.proyectoRepository.eliminarDocumentoProyecto(idDocumento, idUsuarioModificacion);
    }
}
