import type {
  DashboardRangoFechas,
  DashboardCantidadJornadasCompletasSemana,
  IDashboardRepository,
} from '../../../domain/repositories/dashboard.repository.interface';

export class ObtenerCantidadJornadasCompletasSemanaUseCase {
  constructor(private readonly dashboardRepository: IDashboardRepository) {}
  async execute(
    rango?: DashboardRangoFechas,
  ): Promise<DashboardCantidadJornadasCompletasSemana[]> {
    return this.dashboardRepository.cantidadJornadasCompletasSemana(rango);
  }
}
