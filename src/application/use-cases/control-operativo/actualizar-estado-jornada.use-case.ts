import type { IControlOperativoRepository } from '../../../domain/repositories/control-operativo.repository.interface';
import { InvalidInputError } from '../../errors/application.error';
import { esEnteroPositivoPostgres } from './habilitar-jornadas-usuarios.use-case';

export class ActualizarEstadoJornadaUseCase {
  constructor(
    private readonly controlOperativoRepository: IControlOperativoRepository,
  ) {}

  /**
   * Cambia el estado de una jornada (ej. Incompleto → Abierta para habilitar registro).
   * Debe ser usado por admin o rol con permiso.
   */
  async execute(params: {
    idJornada: number;
    idEstadoJornada: number;
    idUsuarioModificacion: number;
    duracionMinutos?: number;
  }): Promise<boolean> {
    const {
      idJornada,
      idEstadoJornada,
      idUsuarioModificacion,
      duracionMinutos,
    } = params;
    if (
      !esEnteroPositivoPostgres(idJornada) ||
      ![372, 373, 398, 399, 400, 401].includes(idEstadoJornada)
    ) {
      throw new InvalidInputError('Indique una jornada y un estado válidos');
    }
    if (!esEnteroPositivoPostgres(idUsuarioModificacion)) {
      throw new InvalidInputError('El usuario que modifica es obligatorio');
    }
    if (
      (idEstadoJornada === 372 || duracionMinutos !== undefined) &&
      !esEnteroPositivoPostgres(duracionMinutos)
    ) {
      throw new InvalidInputError(
        'Para habilitar una jornada indique una duración en minutos mayor que cero',
      );
    }
    return this.controlOperativoRepository.actualizarEstadoJornada(
      idJornada,
      idEstadoJornada,
      idUsuarioModificacion,
      duracionMinutos,
    );
  }
}
