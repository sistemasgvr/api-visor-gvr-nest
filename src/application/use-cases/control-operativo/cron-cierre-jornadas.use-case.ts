import { Injectable, Inject } from '@nestjs/common';
import type {
    IControlOperativoRepository,
    CronCierreJornadasResult,
} from '../../../domain/repositories/control-operativo.repository.interface';
import { CONTROL_OPERATIVO_REPOSITORY } from '../../../domain/repositories/control-operativo.repository.interface';

@Injectable()
export class CronCierreJornadasUseCase {
    constructor(
        @Inject(CONTROL_OPERATIVO_REPOSITORY)
        private readonly controlOperativoRepository: IControlOperativoRepository,
    ) {}

    /**
     * Ejecuta el cron único de cierre de jornadas: crea Alertas para quien no abrió,
     * y para el día anterior pasa Alertas a Incompleto o Completado según actividades.
     */
    async execute(fecha: string): Promise<CronCierreJornadasResult> {
        const f = fecha?.trim();
        if (!f || !/^\d{4}-\d{2}-\d{2}$/.test(f)) {
            throw new Error('Fecha inválida; use formato YYYY-MM-DD');
        }
        return this.controlOperativoRepository.ejecutarCronCierreJornadas(f);
    }
}
