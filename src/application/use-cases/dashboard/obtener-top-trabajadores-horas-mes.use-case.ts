import { Injectable, Inject } from '@nestjs/common';
import type { IDashboardRepository, DashboardTopTrabajadoresHorasMes } from '../../../domain/repositories/dashboard/dashboard.repository.interface';
import { DASHBOARD_REPOSITORY } from '../../../domain/repositories/dashboard/dashboard.repository.interface';

@Injectable()
export class ObtenerTopTrabajadoresHorasMesUseCase {
    constructor(@Inject(DASHBOARD_REPOSITORY) private readonly dashboardRepository: IDashboardRepository) {}
    async execute(): Promise<DashboardTopTrabajadoresHorasMes[]> {
        return this.dashboardRepository.topTrabajadoresHorasMes();
    }
}