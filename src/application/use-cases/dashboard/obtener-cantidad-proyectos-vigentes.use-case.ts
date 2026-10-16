import type {
  DashboardCantidadProyectosVigentes,
  IDashboardRepository,
} from '../../../domain/repositories/dashboard/dashboard.repository.interface';

export class ObtenerCantidadProyectosVigentesUseCase {
  constructor(private readonly dashboardRepository: IDashboardRepository) {}

  async execute(): Promise<DashboardCantidadProyectosVigentes> {
    return this.dashboardRepository.cantidadProyectosVigentes();
  }
}
