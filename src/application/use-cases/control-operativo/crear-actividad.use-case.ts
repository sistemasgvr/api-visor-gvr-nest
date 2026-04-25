import { Injectable, Inject, Logger } from '@nestjs/common';
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
  private readonly logger = new Logger(CrearActividadUseCase.name);

  constructor(
    @Inject(CONTROL_OPERATIVO_REPOSITORY)
    private readonly controlOperativoRepository: IControlOperativoRepository,
    @Inject(PROYECTO_REPOSITORY)
    private readonly proyectoRepository: IProyectoRepository,
    private readonly broadcastService: BroadcastService,
  ) {}

  async execute(params: CrearActividadParams): Promise<ActividadCreada | null> {
    // Coordinador: el asignado al miembro del equipo en el proyecto o el primer coordinador del proyecto
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

    return data;
  }

  /** Coordinador asignado al trabajador en el proyecto; si no tiene, el primer coordinador del proyecto. */
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
