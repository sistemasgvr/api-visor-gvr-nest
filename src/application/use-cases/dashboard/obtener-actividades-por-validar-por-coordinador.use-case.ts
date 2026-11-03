import type {
  DashboardActividadesPorValidarPorCoordinador,
  DashboardRangoFechas,
  IDashboardRepository,
} from '../../../domain/repositories/dashboard.repository.interface';

export class ObtenerActividadesPorValidarPorCoordinadorUseCase {
  constructor(private readonly dashboardRepository: IDashboardRepository) {}
  async execute(
    rango?: DashboardRangoFechas,
  ): Promise<DashboardActividadesPorValidarPorCoordinador[]> {
    return this.dashboardRepository.actividadesPorValidarPorCoordinador(rango);
  }
}
