import type {
  DashboardRangoFechas,
  DashboardHorasEsperadasVsRegistradasMes,
  IDashboardRepository,
} from '../../../domain/repositories/dashboard.repository.interface';

export class ObtenerHorasEsperadasVsRegistradasMesUseCase {
  constructor(private readonly dashboardRepository: IDashboardRepository) {}
  async execute(
    rango?: DashboardRangoFechas,
  ): Promise<DashboardHorasEsperadasVsRegistradasMes[]> {
    return this.dashboardRepository.horasEsperadasVsRegistradasMes(rango);
  }
}
