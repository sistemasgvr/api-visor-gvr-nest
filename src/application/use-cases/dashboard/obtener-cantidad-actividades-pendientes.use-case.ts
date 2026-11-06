import type {
  DashboardRangoFechas,
  DashboardCantidadActividadesPendientes,
  IDashboardRepository,
} from '../../../domain/repositories/dashboard.repository.interface';

export class ObtenerCantidadActividadesPendientesUseCase {
  constructor(private readonly dashboardRepository: IDashboardRepository) {}
  async execute(
    rango?: DashboardRangoFechas,
  ): Promise<DashboardCantidadActividadesPendientes> {
    return this.dashboardRepository.cantidadActividadesPendientes(rango);
  }
}
