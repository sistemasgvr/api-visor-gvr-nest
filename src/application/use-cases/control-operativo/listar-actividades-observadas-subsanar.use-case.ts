import type {
  IControlOperativoRepository,
  ListarActividadesObservadasSubsanarResult,
} from '../../../domain/repositories/control-operativo.repository.interface';
import { UnauthenticatedError } from '../../errors/application.error';

export interface ListarActividadesObservadasSubsanarInput {
  idUsuario: number;
  idProyectoFiltro?: number | null;
  limit?: number;
  offset?: number;
}

export class ListarActividadesObservadasSubsanarUseCase {
  constructor(
    private readonly controlOperativoRepository: IControlOperativoRepository,
  ) {}

  async execute(
    input: ListarActividadesObservadasSubsanarInput,
  ): Promise<ListarActividadesObservadasSubsanarResult> {
    const idTrabajadorSesion =
      await this.controlOperativoRepository.obtenerIdTrabajadorPorIdUsuario(
        input.idUsuario,
      );
    if (idTrabajadorSesion == null) {
      throw new UnauthenticatedError(
        'No se encontró trabajador asociado al usuario',
      );
    }
    return this.controlOperativoRepository.listarActividadesObservadasSubsanar({
      idTrabajadorSesion,
      idProyectoFiltro: input.idProyectoFiltro ?? null,
      limit: input.limit ?? 200,
      offset: input.offset ?? 0,
    });
  }
}
