import type {
  DashboardCantidadTrabajadoresConectadoSemana,
  IDashboardRepository,
} from '../../../domain/repositories/dashboard/dashboard.repository.interface';

export class ObtenerCantidadTrabajadoresConectadoSemanaUseCase {
  constructor(private readonly dashboardRepository: IDashboardRepository) {}
  async execute(): Promise<DashboardCantidadTrabajadoresConectadoSemana[]> {
    return this.dashboardRepository.cantidadTrabajadoresConectadoSemana();
  }
}
