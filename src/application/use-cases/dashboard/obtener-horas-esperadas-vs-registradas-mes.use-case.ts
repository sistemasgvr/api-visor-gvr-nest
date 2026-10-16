import type {
  DashboardHorasEsperadasVsRegistradasMes,
  IDashboardRepository,
} from '../../../domain/repositories/dashboard/dashboard.repository.interface';

export class ObtenerHorasEsperadasVsRegistradasMesUseCase {
  constructor(private readonly dashboardRepository: IDashboardRepository) {}
  async execute(): Promise<DashboardHorasEsperadasVsRegistradasMes[]> {
    return this.dashboardRepository.horasEsperadasVsRegistradasMes();
  }
}
