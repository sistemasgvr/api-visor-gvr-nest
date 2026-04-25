import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { NOTIFICACIONES_REPOSITORY } from '../../../domain/repositories/notificaciones.repository.interface';
import type { INotificacionesRepository } from '../../../domain/repositories/notificaciones.repository.interface';

@Injectable()
export class EliminarNotificacionUseCase {
  constructor(
    @Inject(NOTIFICACIONES_REPOSITORY)
    private readonly notificacionesRepository: INotificacionesRepository,
  ) {}

  async execute(idNotificacion: number, idUsuario: number): Promise<void> {
    const deleted = await this.notificacionesRepository.eliminarNotificacion(
      idNotificacion,
      idUsuario,
    );
    if (!deleted) {
      throw new NotFoundException(
        'Notificación no encontrada o ya fue eliminada',
      );
    }
  }
}
