import { Injectable, Inject } from '@nestjs/common';
import type {
    IControlOperativoRepository,
    CrearActividadParams,
    ActividadCreada,
} from '../../../domain/repositories/control-operativo.repository.interface';
import { CONTROL_OPERATIVO_REPOSITORY } from '../../../domain/repositories/control-operativo.repository.interface';
import { BroadcastService } from '../../../shared/services/broadcast.service';

@Injectable()
export class CrearActividadUseCase {
    constructor(
        @Inject(CONTROL_OPERATIVO_REPOSITORY)
        private readonly controlOperativoRepository: IControlOperativoRepository,
        private readonly broadcastService: BroadcastService,
    ) {}

    async execute(params: CrearActividadParams): Promise<ActividadCreada | null> {
        const data = await this.controlOperativoRepository.crearActividad(params);
        if (!data) return null;

        try {
            const nombreTrabajador =
                await this.controlOperativoRepository.obtenerNombreTrabajadorPorId(data.idtrabajador);
            const nombreAutor = nombreTrabajador?.trim() || 'Un usuario';

            const idResponsable = await this.controlOperativoRepository.obtenerIdResponsablePorIdTrabajador(
                data.idtrabajador,
            );
            if (idResponsable != null) {
                const idUsuarioResponsable =
                    await this.controlOperativoRepository.obtenerIdUsuarioPorIdTrabajador(idResponsable);
                if (idUsuarioResponsable != null) {
                    const notification = {
                        type: 'actividad_registrada',
                        title: 'Nueva actividad registrada',
                        message: `ha registrado una nueva actividad pendiente de revisión: "${data.nombreactividad}"`,
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
            console.error('Error al emitir notificación de actividad registrada:', error);
        }

        return data;
    }
}
