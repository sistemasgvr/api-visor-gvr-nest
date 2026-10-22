import { ApplicationLogger, LoggerFactoryPort } from '../../ports/runtime.port';

import type {
  ActividadCreada,
  ActualizarActividadParams,
  IControlOperativoRepository,
} from '../../../domain/repositories/control-operativo.repository.interface';
import type { IProyectoRepository } from '../../../domain/repositories/proyecto.repository.interface';
import { BroadcastPort } from '../../ports/broadcast.port';
import { emitirEntregableCulminado } from '../proyecto/entregable-notificaciones.helper';

export class ActualizarActividadUseCase {
  private readonly logger: ApplicationLogger;

  constructor(
    private readonly controlOperativoRepository: IControlOperativoRepository,

    private readonly proyectoRepository: IProyectoRepository,
    private readonly broadcastService: BroadcastPort,
    private readonly loggerFactory: LoggerFactoryPort,
  ) {
    this.logger = this.loggerFactory.create(ActualizarActividadUseCase.name);
  }

  async execute(
    params: ActualizarActividadParams,
  ): Promise<ActividadCreada | null> {
    const data =
      await this.controlOperativoRepository.actualizarActividad(params);
    if (!data) return null;

    if (params.corregirObservacion === true) {
      try {
        const nombreTrabajador =
          await this.controlOperativoRepository.obtenerNombreTrabajadorPorId(
            params.idTrabajador,
          );
        const nombreAutor = nombreTrabajador?.trim() || 'Un usuario';
        const notification = {
          type: 'actividad_corregida',
          title: 'Actividad corregida',
          message: `ha corregido las observaciones de la actividad "${data.nombreactividad}". Pendiente de revisión.`,
          createdBy: {
            id: data.idtrabajador,
            name: nombreAutor,
            fotoPerfil: null as string | null,
          },
          idActividad: data.id,
          idJornada: data.idjornada,
          idProyecto: data.idproyecto,
          idTrabajador: data.idtrabajador,
          nombreActividad: data.nombreactividad,
          horainicio: data.horainicio,
          horafin: data.horafin,
          horasdedicadas: data.horasdedicadas,
          timestamp: new Date().toISOString(),
        };

        let idUsuarioANotificar: number | null = null;
        if (data.idcoordinador != null) {
          idUsuarioANotificar =
            await this.controlOperativoRepository.obtenerIdUsuarioPorIdTrabajador(
              data.idcoordinador,
            );
          if (idUsuarioANotificar != null) {
            this.logger.log(
              `[NOTIF] ActualizarActividad: notificando al coordinador del proyecto userId=${idUsuarioANotificar} (idActividad=${data.id})`,
            );
          }
        }
        if (idUsuarioANotificar == null) {
          const idResponsable =
            await this.controlOperativoRepository.obtenerIdResponsablePorIdTrabajador(
              params.idTrabajador,
            );
          if (idResponsable != null) {
            idUsuarioANotificar =
              await this.controlOperativoRepository.obtenerIdUsuarioPorIdTrabajador(
                idResponsable,
              );
            if (idUsuarioANotificar != null) {
              this.logger.log(
                `[NOTIF] ActualizarActividad: notificando al responsable del trabajador userId=${idUsuarioANotificar} (idActividad=${data.id})`,
              );
            }
          }
        }
        if (idUsuarioANotificar != null) {
          await this.broadcastService.emitNotificationToUser(
            idUsuarioANotificar,
            notification,
          );
        } else {
          this.logger.warn(
            `[NOTIF] ActualizarActividad: no se pudo obtener idUsuario para notificar corrección (idActividad=${data.id})`,
          );
        }
      } catch (error) {
        this.logger.error(
          'Error al emitir notificación de actividad corregida:',
          error,
        );
      }
    }

    if (
      data.entregableculminado === true &&
      data.identregable != null &&
      Number(data.identregable) > 0
    ) {
      const idUsuarioActor =
        await this.controlOperativoRepository.obtenerIdUsuarioPorIdTrabajador(
          data.idtrabajador,
        );
      if (idUsuarioActor != null) {
        await emitirEntregableCulminado({
          logger: this.loggerFactory.create('EntregableNotificaciones'),
          broadcast: this.broadcastService,
          proyectoRepository: this.proyectoRepository,
          idEntregable: Number(data.identregable),
          idUsuarioActor,
          idTrabajadorActor: data.idtrabajador,
          nombreActividad: data.nombreactividad,
        });
      }
    }

    return data;
  }
}
