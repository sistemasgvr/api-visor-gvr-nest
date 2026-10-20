import type {
  IControlOperativoRepository,
  ListarActividadesValidacionResult,
} from '../../../domain/repositories/control-operativo.repository.interface';

export interface ListarActividadesValidacionInput {
  idUsuario: number;
  idTrabajadorFiltro?: number | null;
  idProyectoFiltro?: number | null;
  idEstadoActividadFiltro?: number | null;
  limit?: number;
  offset?: number;
  /** `control_operativo.validacion.ver` con alcance «todos». */
  accesoTotal: boolean;
}

export class ListarActividadesValidacionUseCase {
  constructor(
    private readonly controlOperativoRepository: IControlOperativoRepository,
  ) {}

  async execute(
    input: ListarActividadesValidacionInput,
  ): Promise<ListarActividadesValidacionResult> {
    const esAdmin = input.accesoTotal;

    const idTrabajadorSesion =
      await this.controlOperativoRepository.obtenerIdTrabajadorPorIdUsuario(
        input.idUsuario,
      );
    if (idTrabajadorSesion == null) {
      return {
        data: [],
        totalCount: 0,
        totalHoras: 0,
        countPorAprobar: 0,
        countVencidas: 0,
      };
    }
    return this.controlOperativoRepository.listarActividadesValidacion({
      idTrabajadorSesion,
      esAdmin,
      idTrabajadorFiltro: input.idTrabajadorFiltro ?? null,
      idProyectoFiltro: input.idProyectoFiltro ?? null,
      idEstadoActividadFiltro: input.idEstadoActividadFiltro ?? null,
      limit: input.limit ?? 50,
      offset: input.offset ?? 0,
    });
  }
}
