import { Injectable, Inject } from '@nestjs/common';
import type { IDashboardRepository, DashboardCantidadJornadasCompletasSemana } from '../../../domain/repositories/dashboard/dashboard.repository.interface';
import { DASHBOARD_REPOSITORY } from '../../../domain/repositories/dashboard/dashboard.repository.interface';

@Injectable()
export class ObtenerCantidadJornadasCompletasSemanaUseCase {
    constructor(@Inject(DASHBOARD_REPOSITORY) private readonly dashboardRepository: IDashboardRepository) {}
    async execute(): Promise<DashboardCantidadJornadasCompletasSemana[]> {
        return this.dashboardRepository.cantidadJornadasCompletasSemana();
    }
}