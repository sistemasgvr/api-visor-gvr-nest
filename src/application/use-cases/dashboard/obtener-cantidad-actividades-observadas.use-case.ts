import { Injectable, Inject } from '@nestjs/common';
import type { IDashboardRepository, DashboardCantidadActividadesObservadas } from '../../../domain/repositories/dashboard/dashboard.repository.interface';
import { DASHBOARD_REPOSITORY } from '../../../domain/repositories/dashboard/dashboard.repository.interface';

@Injectable()
export class ObtenerCantidadActividadesObservadasUseCase {
    constructor(@Inject(DASHBOARD_REPOSITORY) private readonly dashboardRepository: IDashboardRepository) {}
    async execute(): Promise<DashboardCantidadActividadesObservadas> {
        return this.dashboardRepository.cantidadActividadesObservadas();
    }
}