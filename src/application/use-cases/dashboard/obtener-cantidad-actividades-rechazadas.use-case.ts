import { Injectable, Inject } from '@nestjs/common';
import type {
  IDashboardRepository,
  DashboardCantidadActividadesRechazadas,
} from '../../../domain/repositories/dashboard/dashboard.repository.interface';
import { DASHBOARD_REPOSITORY } from '../../../domain/repositories/dashboard/dashboard.repository.interface';

@Injectable()
export class ObtenerCantidadActividadesRechazadasUseCase {
  constructor(
    @Inject(DASHBOARD_REPOSITORY)
    private readonly dashboardRepository: IDashboardRepository,
  ) {}
  async execute(): Promise<DashboardCantidadActividadesRechazadas> {
    return this.dashboardRepository.cantidadActividadesRechazadas();
  }
}
