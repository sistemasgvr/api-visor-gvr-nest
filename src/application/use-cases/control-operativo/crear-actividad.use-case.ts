import { ApplicationLogger, LoggerFactoryPort } from '../../ports/runtime.port';

import type {
  ActividadCreada,
  CrearActividadParams,
  IControlOperativoRepository,
} from '../../../domain/repositories/control-operativo.repository.interface';
import type { IProyectoRepository } from '../../../domain/repositories/proyecto.repository.interface';
import { BroadcastPort } from '../../ports/broadcast.port';
import { emitirEntregableCulminado } from '../proyecto/entregable-notificaciones.helper';

export class CrearActividadUseCase {
  private readonly logger: ApplicationLogger;

  constructor(
    private readonly controlOperativoRepository: IControlOperativoRepository,

    private readonly proyectoRepository: IProyectoRepository,
    private readonly broadcastService: BroadcastPort,
    private readonly loggerFactory: LoggerFactoryPort,
  ) {
    this.logger = this.loggerFactory.create(CrearActividadUseCase.name);
  }

  async execute(params: CrearActividadParams): Promise<ActividadCreada | null> {
    const idCoordinador =
      params.idCoordinador != null
        ? params.idCoordinador
        : await this.obtenerIdCoordinadorParaTrabajadorEnProyecto(
            params.idProyecto,
            params.idTrabajador,
          );

    const data = await this.controlOperativoRepository.crearActividad({
      ...params,
      idCoordinador,
    });
    if (!data) return null;

    try {
      const nombreTrabajador =
        await this.controlOperativoRepository.obtenerNombreTrabajadorPorId(
          data.idtrabajador,
        );
      const nombreAutor = nombreTrabajador?.trim() || 'Un usuario';

      const notification = {
        type: 'actividad_registrada',
        title: 'Nueva actividad registrada',
        message: `ha registrado una nueva actividad pendiente de revisión: "${data.nombreactividad}"`,
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

      const esCoordinadorQuienRegistra =
        data.idcoordinador != null && data.idtrabajador === data.idcoordinador;
      this.logger.log(
        `[NOTIF] CrearActividad: idActividad=${data.id} esCoordinadorQuienRegistra=${esCoordinadorQuienRegistra} idcoordinador=${data.idcoordinador ?? 'N/A'}`,
      );

      if (esCoordinadorQuienRegistra && data.idcoordinador != null) {
        const idResponsableCoordinador =
          await this.controlOperativoRepository.obtenerIdResponsablePorIdTrabajador(
            data.idcoordinador,
          );
        if (idResponsableCoordinador != null) {
          const idUsuarioResponsable =
            await this.controlOperativoRepository.obtenerIdUsuarioPorIdTrabajador(
              idResponsableCoordinador,
            );
          if (idUsuarioResponsable != null) {
            this.logger.log(
              `[NOTIF] CrearActividad: notificando a responsable del coordinador userId=${idUsuarioResponsable}`,
            );
            await this.broadcastService.emitNotificationToUser(
              idUsuarioResponsable,
              notification,
            );
          } else {
            this.logger.warn(
              `[NOTIF] CrearActividad: idUsuarioResponsable es null (coordinador sin responsable)`,
            );
          }
        }
      } else {
        if (data.idcoordinador != null) {
          const idUsuarioCoordinador =
            await this.controlOperativoRepository.obtenerIdUsuarioPorIdTrabajador(
              data.idcoordinador,
            );
          if (idUsuarioCoordinador != null) {
            this.logger.log(
              `[NOTIF] CrearActividad: notificando a coordinador del proyecto userId=${idUsuarioCoordinador}`,
            );
            await this.broadcastService.emitNotificationToUser(
              idUsuarioCoordinador,
              notification,
            );
          } else {
            this.logger.warn(
              `[NOTIF] CrearActividad: idUsuarioCoordinador es null (coordinador sin idusuario en tratrabajador)`,
            );
          }
        }
      }
    } catch (error) {
      console.error(
        'Error al emitir notificación de actividad registrada:',
        error,
      );
    }

    if (
      params.entregableCulminado === true &&
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

  private async obtenerIdCoordinadorParaTrabajadorEnProyecto(
    idProyecto: number,
    idTrabajador: number,
  ): Promise<number | null> {
    const asignado =
      await this.proyectoRepository.obtenerCoordinadorParaTrabajadorEnProyecto(
        idProyecto,
        idTrabajador,
      );
    if (asignado != null) return asignado;
    return this.proyectoRepository.obtenerPrimerCoordinadorProyecto(idProyecto);
  }
}
