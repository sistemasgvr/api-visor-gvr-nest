import type {
  DashboardCantidadActividadesObservadas,
  IDashboardRepository,
} from '../../../domain/repositories/dashboard.repository.interface';

export class ObtenerCantidadActividadesObservadasUseCase {
  constructor(private readonly dashboardRepository: IDashboardRepository) {}
  async execute(): Promise<DashboardCantidadActividadesObservadas> {
    return this.dashboardRepository.cantidadActividadesObservadas();
  }
}
