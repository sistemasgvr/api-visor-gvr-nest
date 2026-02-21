import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import type { IProyectoRepository } from '../../../domain/repositories/proyecto.repository.interface';
import { PROYECTO_REPOSITORY } from '../../../domain/repositories/proyecto.repository.interface';
import { AsignarAccesoProyectoDto } from '../../dtos/proyecto/asignar-acceso-proyecto.dto';

@Injectable()
export class AsignarAccesoProyectoUseCase {
    constructor(
        @Inject(PROYECTO_REPOSITORY)
        private readonly proyectoRepository: IProyectoRepository,
    ) {}

    async execute(idProyecto: number, dto: AsignarAccesoProyectoDto, idUsuarioCreacion: number) {
        const resultado = await this.proyectoRepository.asignarAccesoProyecto(
            idProyecto,
            dto.idUsuario,
            dto.idNivelAcceso ?? null,
            idUsuarioCreacion,
        );

        if (!resultado?.success) {
            throw new BadRequestException(resultado?.message ?? 'Error al asignar acceso');
        }

        return {
            message: resultado.message,
            id: resultado.id,
        };
    }
}
