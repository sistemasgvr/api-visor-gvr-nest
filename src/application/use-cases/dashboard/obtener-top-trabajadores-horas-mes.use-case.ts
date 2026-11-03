import type {
  DashboardRangoFechas,
  DashboardTopTrabajadoresHorasMes,
  IDashboardRepository,
} from '../../../domain/repositories/dashboard.repository.interface';

export class ObtenerTopTrabajadoresHorasMesUseCase {
  constructor(private readonly dashboardRepository: IDashboardRepository) {}
  async execute(
    rango?: DashboardRangoFechas,
  ): Promise<DashboardTopTrabajadoresHorasMes[]> {
    return this.dashboardRepository.topTrabajadoresHorasMes(rango);
  }
}
