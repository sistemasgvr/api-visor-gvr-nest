import { Injectable, Inject } from '@nestjs/common';
import { NOTIFICACIONES_REPOSITORY } from '../../../domain/repositories/notificaciones.repository.interface';
import type { INotificacionesRepository } from '../../../domain/repositories/notificaciones.repository.interface';

@Injectable()
export class ObtenerNotificacionesUseCase {
    constructor(
        @Inject(NOTIFICACIONES_REPOSITORY)
        private readonly notificacionesRepository: INotificacionesRepository,
    ) {}

    async execute(userId: number, tipo?: string): Promise<any[]> {
        const notificaciones = await this.notificacionesRepository.obtenerNotificaciones(userId, tipo);

        return notificaciones.map((notif: any) => {
            const datos = notif.datos
                ? (typeof notif.datos === 'string' ? JSON.parse(notif.datos) : notif.datos)
                : {};

            return {
                id: `notif-${notif.id}`,
                type: notif.tipo,
                title: notif.titulo,
                message: notif.mensaje || datos.message || null,
                timestamp: notif.fechacreacion
                    ? new Date(notif.fechacreacion).toISOString()
                    : new Date().toISOString(),
                read: !!notif.entregada,
                ...datos,
            };
        });
    }
}
