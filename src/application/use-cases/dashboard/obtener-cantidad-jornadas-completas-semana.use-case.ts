import type {
  DashboardCantidadJornadasCompletasSemana,
  IDashboardRepository,
} from '../../../domain/repositories/dashboard.repository.interface';

export class ObtenerCantidadJornadasCompletasSemanaUseCase {
  constructor(private readonly dashboardRepository: IDashboardRepository) {}
  async execute(): Promise<DashboardCantidadJornadasCompletasSemana[]> {
    return this.dashboardRepository.cantidadJornadasCompletasSemana();
  }
}
