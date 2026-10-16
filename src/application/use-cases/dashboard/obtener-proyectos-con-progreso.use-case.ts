import type {
  DashboardProyectosConProgreso,
  IDashboardRepository,
} from '../../../domain/repositories/dashboard.repository.interface';

export class ObtenerProyectosConProgresoUseCase {
  constructor(private readonly dashboardRepository: IDashboardRepository) {}
  async execute(): Promise<DashboardProyectosConProgreso[]> {
    return this.dashboardRepository.proyectosConProgreso();
  }
}
