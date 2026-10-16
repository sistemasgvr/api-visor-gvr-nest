import type { INotificacionesRepository } from '../../../domain/repositories/notificaciones.repository.interface';
import { NotFoundError } from '../../errors/application.error';

export class EliminarNotificacionUseCase {
  constructor(
    private readonly notificacionesRepository: INotificacionesRepository,
  ) {}

  async execute(idNotificacion: number, idUsuario: number): Promise<void> {
    const deleted = await this.notificacionesRepository.eliminarNotificacion(
      idNotificacion,
      idUsuario,
    );
    if (!deleted) {
      throw new NotFoundError('Notificación no encontrada o ya fue eliminada');
    }
  }
}
