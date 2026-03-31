import { Injectable, Inject } from '@nestjs/common';
import type { IDashboardRepository, DashboardCantidadProyectosVigentes } from '../../../domain/repositories/dashboard/dashboard.repository.interface';
import { DASHBOARD_REPOSITORY } from '../../../domain/repositories/dashboard/dashboard.repository.interface';

@Injectable()
export class ObtenerCantidadProyectosVigentesUseCase {
    constructor(
        @Inject(DASHBOARD_REPOSITORY)
        private readonly dashboardRepository: IDashboardRepository,
    ) {}

    async execute(): Promise<DashboardCantidadProyectosVigentes> {
        return this.dashboardRepository.cantidadProyectosVigentes();
    }
}