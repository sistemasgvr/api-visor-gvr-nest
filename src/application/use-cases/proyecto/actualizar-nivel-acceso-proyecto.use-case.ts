import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import type { IProyectoRepository } from '../../../domain/repositories/proyecto.repository.interface';
import { PROYECTO_REPOSITORY } from '../../../domain/repositories/proyecto.repository.interface';
import { ActualizarNivelAccesoProyectoDto } from '../../dtos/proyecto/actualizar-nivel-acceso-proyecto.dto';

@Injectable()
export class ActualizarNivelAccesoProyectoUseCase {
    constructor(
        @Inject(PROYECTO_REPOSITORY)
        private readonly proyectoRepository: IProyectoRepository,
    ) {}

    async execute(idProyecto: number, idAcceso: number, dto: ActualizarNivelAccesoProyectoDto, idUsuarioModificacion: number) {
        const resultado = await this.proyectoRepository.actualizarNivelAccesoProyecto(
            idAcceso,
            dto.idNivelAcceso,
            idUsuarioModificacion,
        );

        if (!resultado?.success) {
            throw new BadRequestException(resultado?.message ?? 'Error al actualizar nivel de acceso');
        }

        return { message: resultado.message };
    }
}
