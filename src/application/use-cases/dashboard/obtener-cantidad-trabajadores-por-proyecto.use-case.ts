import type {
  DashboardCantidadTrabajadoresPorProyecto,
  IDashboardRepository,
} from '../../../domain/repositories/dashboard.repository.interface';

export class ObtenerCantidadTrabajadoresPorProyectoUseCase {
  constructor(private readonly dashboardRepository: IDashboardRepository) {}
  async execute(): Promise<DashboardCantidadTrabajadoresPorProyecto[]> {
    return this.dashboardRepository.cantidadTrabajadoresPorProyecto();
  }
}
