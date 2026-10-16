import { type IAccRecursosRepository } from '../../../domain/repositories/acc-recursos.repository.interface';
import { ObtenerRecursosProyectoDto } from '../../inputs/acc-recursos/obtener-recursos-proyecto.dto';

export class ObtenerRecursosProyectoUseCase {
  constructor(private readonly accRecursosRepository: IAccRecursosRepository) {}

  async execute(
    projectId: string,
    dto: ObtenerRecursosProyectoDto,
  ): Promise<any> {
    const limit = dto.limit || 20;
    const offset = dto.offset || 0;

    const recursos =
      await this.accRecursosRepository.obtenerRecursosPorProyecto(
        projectId,
        dto.tipo || null,
        limit,
        offset,
      );

    if (!recursos || recursos.length === 0) {
      return {
        data: [],
        pagination: {
          total: 0,
          limit,
          offset,
          total_pages: 0,
          current_page: 1,
        },
      };
    }

    const totalRegistros = recursos[0]?.total_registros || 0;

    return {
      data: recursos,
      pagination: {
        total: Number(totalRegistros),
        limit,
        offset,
        total_pages: limit > 0 ? Math.ceil(Number(totalRegistros) / limit) : 0,
        current_page: limit > 0 ? Math.floor(offset / limit) + 1 : 1,
      },
    };
  }
}
