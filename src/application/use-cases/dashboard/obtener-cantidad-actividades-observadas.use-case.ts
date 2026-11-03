import type {
  DashboardRangoFechas,
  DashboardCantidadActividadesObservadas,
  IDashboardRepository,
} from '../../../domain/repositories/dashboard.repository.interface';

export class ObtenerCantidadActividadesObservadasUseCase {
  constructor(private readonly dashboardRepository: IDashboardRepository) {}
  async execute(
    rango?: DashboardRangoFechas,
  ): Promise<DashboardCantidadActividadesObservadas> {
    return this.dashboardRepository.cantidadActividadesObservadas(rango);
  }
}
