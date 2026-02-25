import { Injectable, Inject } from '@nestjs/common';
import type {
    IControlOperativoRepository,
    CrearActividadParams,
    ActividadCreada,
} from '../../../domain/repositories/control-operativo.repository.interface';
import { CONTROL_OPERATIVO_REPOSITORY } from '../../../domain/repositories/control-operativo.repository.interface';
import type { IProyectoRepository } from '../../../domain/repositories/proyecto.repository.interface';
import { PROYECTO_REPOSITORY } from '../../../domain/repositories/proyecto.repository.interface';
import { BroadcastService } from '../../../shared/services/broadcast.service';

@Injectable()
export class CrearActividadUseCase {
    constructor(
        @Inject(CONTROL_OPERATIVO_REPOSITORY)
        private readonly controlOperativoRepository: IControlOperativoRepository,
        @Inject(PROYECTO_REPOSITORY)
        private readonly proyectoRepository: IProyectoRepository,
        private readonly broadcastService: BroadcastService,
    ) {}

    async execute(params: CrearActividadParams): Promise<ActividadCreada | null> {
        const idCoordinador =
            params.idCoordinador != null
                ? params.idCoordinador
                : await this.obtenerIdCoordinadorDelProyecto(params.idProyecto);

        const data = await this.controlOperativoRepository.crearActividad({
            ...params,
            idCoordinador,
        });
        if (!data) return null;

        try {
            const nombreTrabajador =
                await this.controlOperativoRepository.obtenerNombreTrabajadorPorId(data.idtrabajador);
            const nombreAutor = nombreTrabajador?.trim() || 'Un usuario';

            const idUsuarioANotificar =
                data.idcoordinador != null
                    ? await this.controlOperativoRepository.obtenerIdUsuarioPorIdTrabajador(data.idcoordinador)
                    : await this.controlOperativoRepository
                          .obtenerIdResponsablePorIdTrabajador(data.idtrabajador)
                          .then((idResp) =>
                              idResp != null
                                  ? this.controlOperativoRepository.obtenerIdUsuarioPorIdTrabajador(idResp)
                                  : Promise.resolve(null),
                          );

            if (idUsuarioANotificar != null) {
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
                await this.broadcastService.emitNotificationToUser(idUsuarioANotificar, notification);
            }
        } catch (error) {
            console.error('Error al emitir notificación de actividad registrada:', error);
        }

        return data;
    }

    private async obtenerIdCoordinadorDelProyecto(idProyecto: number): Promise<number | null> {
        const proyecto = await this.proyectoRepository.obtenerProyectoPorId(idProyecto);
        const id = proyecto?.idcoordinador;
        return id != null && Number(id) > 0 ? Number(id) : null;
    }
}
