import { Injectable, Inject } from '@nestjs/common';
import type {
  IControlOperativoRepository,
  ProyectoAccesoTrabajador,
} from '../../../domain/repositories/control-operativo.repository.interface';
import { CONTROL_OPERATIVO_REPOSITORY } from '../../../domain/repositories/control-operativo.repository.interface';

@Injectable()
export class ListarProyectosAccesoTrabajadorUseCase {
  constructor(
    @Inject(CONTROL_OPERATIVO_REPOSITORY)
    private readonly controlOperativoRepository: IControlOperativoRepository,
  ) {}

  async execute(
    idTrabajador: number,
    soloVigentes = false,
  ): Promise<ProyectoAccesoTrabajador[]> {
    return this.controlOperativoRepository.listarProyectosAccesoTrabajador(
      idTrabajador,
      soloVigentes,
    );
  }
}
