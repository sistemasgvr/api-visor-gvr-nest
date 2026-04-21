import { Injectable, Inject } from '@nestjs/common';
import type { IDashboardRepository, DashboardProyectosConProgreso } from '../../../domain/repositories/dashboard/dashboard.repository.interface';
import { DASHBOARD_REPOSITORY } from '../../../domain/repositories/dashboard/dashboard.repository.interface';

@Injectable()
export class ObtenerProyectosConProgresoUseCase {
    constructor(@Inject(DASHBOARD_REPOSITORY) private readonly dashboardRepository: IDashboardRepository) {}
    async execute(): Promise<DashboardProyectosConProgreso[]> {
        return this.dashboardRepository.proyectosConProgreso();
    }
}