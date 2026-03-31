import { Injectable, Inject } from '@nestjs/common';
import type { IDashboardRepository, DashboardCantidadTrabajadoresPorProyecto } from '../../../domain/repositories/dashboard/dashboard.repository.interface';
import { DASHBOARD_REPOSITORY } from '../../../domain/repositories/dashboard/dashboard.repository.interface';

@Injectable()
export class ObtenerCantidadTrabajadoresPorProyectoUseCase {
    constructor(@Inject(DASHBOARD_REPOSITORY) private readonly dashboardRepository: IDashboardRepository) {}
    async execute(): Promise<DashboardCantidadTrabajadoresPorProyecto[]> {
        return this.dashboardRepository.cantidadTrabajadoresPorProyecto();
    }
}