import type {
  DashboardCantidadActividadesRechazadas,
  IDashboardRepository,
} from '../../../domain/repositories/dashboard.repository.interface';

export class ObtenerCantidadActividadesRechazadasUseCase {
  constructor(private readonly dashboardRepository: IDashboardRepository) {}
  async execute(): Promise<DashboardCantidadActividadesRechazadas> {
    return this.dashboardRepository.cantidadActividadesRechazadas();
  }
}
