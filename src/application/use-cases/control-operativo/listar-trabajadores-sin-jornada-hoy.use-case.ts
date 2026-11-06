import type {
  IControlOperativoRepository,
  TrabajadorSinJornadaHoyItem,
} from '../../../domain/repositories/control-operativo.repository.interface';

export interface ListarTrabajadoresSinJornadaHoyResult {
  data: TrabajadorSinJornadaHoyItem[];
  total: number;
}

/** La ruta exige el indicador correspondiente de inicio.indicadores; aquí no se decide por rol. */
export class ListarTrabajadoresSinJornadaHoyUseCase {
  constructor(
    private readonly controlOperativoRepository: IControlOperativoRepository,
  ) {}

  async execute(
    _idUsuario: number,
    fecha: string,
  ): Promise<ListarTrabajadoresSinJornadaHoyResult> {
    const [data, total] = await Promise.all([
      this.controlOperativoRepository.listarTrabajadoresSinJornadaHoy(fecha),
      this.controlOperativoRepository.contarTrabajadoresEsperadosJornadaHoy(
        fecha,
      ),
    ]);
    return { data, total };
  }
}
