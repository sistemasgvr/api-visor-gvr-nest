import { Injectable, Inject } from '@nestjs/common';
import type { IProyectoRepository, GuardarCoordinadoresProyectoPayload } from '../../../domain/repositories/proyecto.repository.interface';
import { PROYECTO_REPOSITORY } from '../../../domain/repositories/proyecto.repository.interface';
import type { GuardarCoordinadoresProyectoDto } from '../../dtos/proyecto/guardar-coordinadores-proyecto.dto';

@Injectable()
export class GuardarCoordinadoresProyectoUseCase {
    constructor(
        @Inject(PROYECTO_REPOSITORY)
        private readonly proyectoRepository: IProyectoRepository,
    ) {}

    async execute(idProyecto: number, dto: GuardarCoordinadoresProyectoDto, idUsuario: number) {
        const payload: GuardarCoordinadoresProyectoPayload[] = (dto.coordinadores ?? []).map((c) => ({
            idtrabajador: c.idtrabajador,
            miembrosEquipo: c.miembrosEquipo ?? [],
        }));
        return this.proyectoRepository.guardarCoordinadoresProyecto(idProyecto, payload, idUsuario);
    }
}
