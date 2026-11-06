import type {
  DashboardRangoFechas,
  DashboardCantidadActividadesRechazadas,
  IDashboardRepository,
} from '../../../domain/repositories/dashboard.repository.interface';

export class ObtenerCantidadActividadesRechazadasUseCase {
  constructor(private readonly dashboardRepository: IDashboardRepository) {}
  async execute(
    rango?: DashboardRangoFechas,
  ): Promise<DashboardCantidadActividadesRechazadas> {
    return this.dashboardRepository.cantidadActividadesRechazadas(rango);
  }
}
