import type {
  DashboardTopTrabajadoresHorasMes,
  IDashboardRepository,
} from '../../../domain/repositories/dashboard/dashboard.repository.interface';

export class ObtenerTopTrabajadoresHorasMesUseCase {
  constructor(private readonly dashboardRepository: IDashboardRepository) {}
  async execute(): Promise<DashboardTopTrabajadoresHorasMes[]> {
    return this.dashboardRepository.topTrabajadoresHorasMes();
  }
}
