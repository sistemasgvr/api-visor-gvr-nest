import type {
  DashboardCantidadActividadesPendientes,
  IDashboardRepository,
} from '../../../domain/repositories/dashboard.repository.interface';

export class ObtenerCantidadActividadesPendientesUseCase {
  constructor(private readonly dashboardRepository: IDashboardRepository) {}
  async execute(): Promise<DashboardCantidadActividadesPendientes> {
    return this.dashboardRepository.cantidadActividadesPendientes();
  }
}
