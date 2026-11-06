import type {
  DashboardRangoFechas,
  DashboardCantidadTrabajadoresConectadoSemana,
  IDashboardRepository,
} from '../../../domain/repositories/dashboard.repository.interface';

export class ObtenerCantidadTrabajadoresConectadoSemanaUseCase {
  constructor(private readonly dashboardRepository: IDashboardRepository) {}
  async execute(
    rango?: DashboardRangoFechas,
  ): Promise<DashboardCantidadTrabajadoresConectadoSemana[]> {
    return this.dashboardRepository.cantidadTrabajadoresConectadoSemana(rango);
  }
}
