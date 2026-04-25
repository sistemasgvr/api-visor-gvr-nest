import { Injectable, Inject } from '@nestjs/common';
import type {
  IControlOperativoRepository,
  ObservacionActividad,
} from '../../../domain/repositories/control-operativo.repository.interface';
import { CONTROL_OPERATIVO_REPOSITORY } from '../../../domain/repositories/control-operativo.repository.interface';

@Injectable()
export class ListarObservacionesActividadUseCase {
  constructor(
    @Inject(CONTROL_OPERATIVO_REPOSITORY)
    private readonly controlOperativoRepository: IControlOperativoRepository,
  ) {}

  async execute(idActividad: number): Promise<ObservacionActividad[]> {
    return this.controlOperativoRepository.listarObservacionesActividad(
      idActividad,
    );
  }
}
