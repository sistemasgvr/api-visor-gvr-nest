import { BadRequestException, Injectable, Inject } from '@nestjs/common';
import type {
  IControlOperativoRepository,
  CrearJornadaParams,
  JornadaCreada,
} from '../../../domain/repositories/control-operativo.repository.interface';
import { CONTROL_OPERATIVO_REPOSITORY } from '../../../domain/repositories/control-operativo.repository.interface';
import { getFechaHoy } from '../../../shared/utils/date.util';

@Injectable()
export class CrearJornadaUseCase {
  constructor(
    @Inject(CONTROL_OPERATIVO_REPOSITORY)
    private readonly controlOperativoRepository: IControlOperativoRepository,
  ) {}

  async execute(params: CrearJornadaParams): Promise<JornadaCreada | null> {
    const fechaHoy = getFechaHoy();
    const fechaJornada = (params.fechaJornada || '').trim().split('T')[0];
    if (fechaJornada && fechaJornada > fechaHoy) {
      throw new BadRequestException(
        'No se puede registrar o ingresar jornada en días futuros. Solo hasta el día actual.',
      );
    }
    return this.controlOperativoRepository.crearJornada(params);
  }
}
