import { Injectable, Inject } from '@nestjs/common';
import type {
    IControlOperativoRepository,
    ActualizarActividadParams,
    ActividadCreada,
} from '../../../domain/repositories/control-operativo.repository.interface';
import { CONTROL_OPERATIVO_REPOSITORY } from '../../../domain/repositories/control-operativo.repository.interface';
import { BroadcastService } from '../../../shared/services/broadcast.service';

@Injectable()
export class ActualizarActividadUseCase {
    constructor(
        @Inject(CONTROL_OPERATIVO_REPOSITORY)
        private readonly controlOperativoRepository: IControlOperativoRepository,
        private readonly broadcastService: BroadcastService,
    ) {}

    async execute(params: ActualizarActividadParams): Promise<ActividadCreada | null> {
        const data = await this.controlOperativoRepository.actualizarActividad(params);
        if (!data) return null;

        if (params.corregirObservacion === true) {
            try {
                const nombreTrabajador =
                    await this.controlOperativoRepository.obtenerNombreTrabajadorPorId(params.idTrabajador);
                const nombreAutor = nombreTrabajador?.trim() || 'Un usuario';
                const idResponsable =
                    await this.controlOperativoRepository.obtenerIdResponsablePorIdTrabajador(params.idTrabajador);
                if (idResponsable != null) {
                    const idUsuarioResponsable =
                        await this.controlOperativoRepository.obtenerIdUsuarioPorIdTrabajador(idResponsable);
                    if (idUsuarioResponsable != null) {
                        const notification = {
                            type: 'actividad_corregida',
                            title: 'Actividad corregida',
                            message: `ha corregido las observaciones de la actividad "${data.nombreactividad}". Pendiente de revisión.`,
                            createdBy: { id: data.idtrabajador, name: nombreAutor, fotoPerfil: null as string | null },
                            idActividad: data.id,
                            idTrabajador: data.idtrabajador,
                            nombreActividad: data.nombreactividad,
                            horainicio: data.horainicio,
                            horafin: data.horafin,
                            horasdedicadas: data.horasdedicadas,
                            timestamp: new Date().toISOString(),
                        };
                        await this.broadcastService.emitNotificationToUser(idUsuarioResponsable, notification);
                    }
                }
            } catch (error) {
                console.error('Error al emitir notificación de actividad corregida:', error);
            }
        }

        return data;
    }
}
