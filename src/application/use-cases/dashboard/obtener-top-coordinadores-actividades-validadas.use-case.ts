import type {
  DashboardRangoFechas,
  DashboardTopCoordinadoresActividadesValidadas,
  IDashboardRepository,
} from '../../../domain/repositories/dashboard.repository.interface';

export class ObtenerTopCoordinadoresActividadesValidadasUseCase {
  constructor(private readonly dashboardRepository: IDashboardRepository) {}
  async execute(
    rango?: DashboardRangoFechas,
  ): Promise<DashboardTopCoordinadoresActividadesValidadas[]> {
    return this.dashboardRepository.topCoordinadoresActividadesValidadas(rango);
  }
}
