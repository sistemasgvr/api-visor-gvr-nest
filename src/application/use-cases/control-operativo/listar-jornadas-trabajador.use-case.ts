import { Injectable, Inject } from '@nestjs/common';
import type {
  IControlOperativoRepository,
  ListarJornadasTrabajadorParams,
  ListarJornadasTrabajadorResult,
} from '../../../domain/repositories/control-operativo.repository.interface';
import { CONTROL_OPERATIVO_REPOSITORY } from '../../../domain/repositories/control-operativo.repository.interface';

@Injectable()
export class ListarJornadasTrabajadorUseCase {
  constructor(
    @Inject(CONTROL_OPERATIVO_REPOSITORY)
    private readonly controlOperativoRepository: IControlOperativoRepository,
  ) {}

  async execute(
    params: ListarJornadasTrabajadorParams,
  ): Promise<ListarJornadasTrabajadorResult> {
    return this.controlOperativoRepository.listarJornadasTrabajador(params);
  }
}
