import type {
  CrearJornadaParams,
  IControlOperativoRepository,
  JornadaCreada,
} from '../../../domain/repositories/control-operativo.repository.interface';
import { getFechaHoy } from '../../../domain/utils/date.util';
import { InvalidInputError } from '../../errors/application.error';

export class CrearJornadaUseCase {
  constructor(
    private readonly controlOperativoRepository: IControlOperativoRepository,
  ) {}

  async execute(params: CrearJornadaParams): Promise<JornadaCreada | null> {
    const fechaHoy = getFechaHoy();
    const fechaJornada = (params.fechaJornada || '').trim().split('T')[0];
    if (fechaJornada && fechaJornada > fechaHoy) {
      throw new InvalidInputError(
        'No se puede registrar o ingresar jornada en días futuros. Solo hasta el día actual.',
      );
    }
    return this.controlOperativoRepository.crearJornada(params);
  }
}
