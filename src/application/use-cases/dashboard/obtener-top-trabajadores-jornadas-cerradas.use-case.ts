import type {
  DashboardRangoFechas,
  DashboardTopTrabajadoresJornadasCerradas,
  IDashboardRepository,
} from '../../../domain/repositories/dashboard.repository.interface';

export class ObtenerTopTrabajadoresJornadasCerradasUseCase {
  constructor(private readonly dashboardRepository: IDashboardRepository) {}
  async execute(
    rango?: DashboardRangoFechas,
  ): Promise<DashboardTopTrabajadoresJornadasCerradas[]> {
    return this.dashboardRepository.topTrabajadoresJornadasCerradas(rango);
  }
}
