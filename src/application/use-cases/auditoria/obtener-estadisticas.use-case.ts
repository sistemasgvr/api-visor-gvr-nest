import { type IAuditoriaRepository } from '../../../domain/repositories/auditoria.repository.interface';
import { ObtenerEstadisticasDto } from '../../inputs/auditoria/obtener-estadisticas.dto';

export class ObtenerEstadisticasUseCase {
  constructor(private readonly auditoriaRepository: IAuditoriaRepository) {}

  async execute(dto: ObtenerEstadisticasDto): Promise<any> {
    const estadisticas = await this.auditoriaRepository.obtenerEstadisticas(
      dto.fecha_desde || null,
      dto.fecha_hasta || null,
    );

    return estadisticas || [];
  }
}
