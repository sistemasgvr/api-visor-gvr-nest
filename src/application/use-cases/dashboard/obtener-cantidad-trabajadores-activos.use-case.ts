import { Injectable, Inject } from '@nestjs/common';
import type { IDashboardRepository, DashboardCantidadTrabajadoresActivos } from '../../../domain/repositories/dashboard/dashboard.repository.interface';
import { DASHBOARD_REPOSITORY } from '../../../domain/repositories/dashboard/dashboard.repository.interface';

@Injectable()
export class ObtenerCantidadTrabajadoresActivosUseCase {
    constructor(
        @Inject(DASHBOARD_REPOSITORY)
        private readonly dashboardRepository: IDashboardRepository,
    ) {}

    async execute(): Promise<DashboardCantidadTrabajadoresActivos> {
        return this.dashboardRepository.cantidadTrabajadoresActivos();
    }
}