import type {
  DashboardCantidadTrabajadoresActivos,
  IDashboardRepository,
} from '../../../domain/repositories/dashboard.repository.interface';

export class ObtenerCantidadTrabajadoresActivosUseCase {
  constructor(private readonly dashboardRepository: IDashboardRepository) {}

  async execute(): Promise<DashboardCantidadTrabajadoresActivos> {
    return this.dashboardRepository.cantidadTrabajadoresActivos();
  }
}
