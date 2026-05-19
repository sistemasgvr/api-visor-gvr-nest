import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import type {
  IControlOperativoRepository,
  ListarActividadesObservadasSubsanarResult,
} from '../../../domain/repositories/control-operativo.repository.interface';
import { CONTROL_OPERATIVO_REPOSITORY } from '../../../domain/repositories/control-operativo.repository.interface';

export interface ListarActividadesObservadasSubsanarInput {
  idUsuario: number;
  idProyectoFiltro?: number | null;
  limit?: number;
  offset?: number;
}

@Injectable()
export class ListarActividadesObservadasSubsanarUseCase {
  constructor(
    @Inject(CONTROL_OPERATIVO_REPOSITORY)
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
      throw new UnauthorizedException(
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
