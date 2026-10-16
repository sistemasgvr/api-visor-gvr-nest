import type { INotificacionesRepository } from '../../../domain/repositories/notificaciones.repository.interface';

export class MarcarNotificacionesEntregadasUseCase {
  constructor(
    private readonly notificacionesRepository: INotificacionesRepository,
  ) {}

  async execute(userId: number): Promise<void> {
    await this.notificacionesRepository.marcarTodasComoEntregadas(userId);
  }
}
