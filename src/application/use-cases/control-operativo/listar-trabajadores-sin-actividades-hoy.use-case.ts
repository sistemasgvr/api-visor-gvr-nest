import type {
  IControlOperativoRepository,
  TrabajadorSinActividadesHoyItem,
} from '../../../domain/repositories/control-operativo.repository.interface';

export interface ListarTrabajadoresSinActividadesHoyResult {
  data: TrabajadorSinActividadesHoyItem[];
  total: number;
}

/** La ruta exige el indicador correspondiente de inicio.indicadores; aquí no se decide por rol. */
export class ListarTrabajadoresSinActividadesHoyUseCase {
  constructor(
    private readonly controlOperativoRepository: IControlOperativoRepository,
  ) {}

  async execute(
    _idUsuario: number,
    fecha: string,
  ): Promise<ListarTrabajadoresSinActividadesHoyResult> {
    const [data, total] = await Promise.all([
      this.controlOperativoRepository.listarTrabajadoresSinActividadesHoy(
        fecha,
      ),
      this.controlOperativoRepository.contarTrabajadoresConJornadaHoy(fecha),
    ]);
    return { data, total };
  }
}
