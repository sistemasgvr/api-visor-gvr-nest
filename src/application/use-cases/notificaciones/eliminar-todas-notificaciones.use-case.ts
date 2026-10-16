import type { INotificacionesRepository } from '../../../domain/repositories/notificaciones.repository.interface';

export class EliminarTodasNotificacionesUseCase {
  constructor(
    private readonly notificacionesRepository: INotificacionesRepository,
  ) {}

  async execute(idUsuario: number): Promise<void> {
    await this.notificacionesRepository.eliminarTodasNotificaciones(idUsuario);
  }
}
