import {
  ID_ESTADO_ACTIVIDAD_APROBADO,
  ID_ESTADO_ACTIVIDAD_RECHAZADO,
} from '../../../domain/constants/estado-actividad.constants';
import type {
  ActividadCreada,
  IControlOperativoRepository,
  ValidarActividadParams,
} from '../../../domain/repositories/control-operativo.repository.interface';
import { ForbiddenError } from '../../errors/application.error';
import { BroadcastPort } from '../../ports/broadcast.port';
import { ApplicationLogger, LoggerFactoryPort } from '../../ports/runtime.port';

export interface ValidarActividadInput {
  idActividad: number;
  idEstadoActividad: number;
  comentarioValidacion?: string | null;
  idUsuario: number;
  /** La acción de validación (aprobar/observar/rechazar) con alcance «todos». */
  accesoTotal: boolean;
}

export class ValidarActividadUseCase {
  private readonly logger: ApplicationLogger;

  constructor(
    private readonly controlOperativoRepository: IControlOperativoRepository,
    private readonly broadcastService: BroadcastPort,
    private readonly loggerFactory: LoggerFactoryPort,
  ) {
    this.logger = this.loggerFactory.create(ValidarActividadUseCase.name);
  }

  async execute(input: ValidarActividadInput): Promise<ActividadCreada | null> {
    const esAdminTotalValidacion = input.accesoTotal;

    const idCoordinadorRevisor =
      await this.controlOperativoRepository.obtenerIdTrabajadorPorIdUsuario(
        input.idUsuario,
      );
    if (idCoordinadorRevisor == null) {
      return null;
    }
    const puede = await this.controlOperativoRepository.puedeValidarActividad(
      input.idActividad,
      idCoordinadorRevisor,
      esAdminTotalValidacion,
    );
    if (!puede) {
      throw new ForbiddenError('No tiene permiso para validar esta actividad');
    }
    const params: ValidarActividadParams = {
      idActividad: input.idActividad,
      idEstadoActividad: input.idEstadoActividad,
      comentarioValidacion: input.comentarioValidacion ?? null,
      idCoordinadorRevisor,
      idUsuarioModificacion: input.idUsuario,
      esAdminTotalValidacion,
    };
    const data = await this.controlOperativoRepository.validarActividad(params);
    if (!data) return null;

    try {
      const nombreRevisor =
        await this.controlOperativoRepository.obtenerNombreTrabajadorPorId(
          idCoordinadorRevisor,
        );
      const nombreRevisorDisplay = nombreRevisor?.trim() || 'El responsable';
      const idUsuarioTrabajador =
        await this.controlOperativoRepository.obtenerIdUsuarioPorIdTrabajador(
          data.idtrabajador,
        );
      this.logger.log(
        `[NOTIF] ValidarActividad: idActividad=${data.id} idEstadoActividad=${input.idEstadoActividad} idUsuarioTrabajador=${idUsuarioTrabajador ?? 'null'}`,
      );
      if (idUsuarioTrabajador != null) {
        let type: string;
        let title: string;
        let message: string;
        if (input.idEstadoActividad === ID_ESTADO_ACTIVIDAD_APROBADO) {
          type = 'actividad_aprobada';
          title = 'Actividad aprobada';
          message = `ha aprobado tu actividad "${data.nombreactividad}".`;
        } else if (input.idEstadoActividad === ID_ESTADO_ACTIVIDAD_RECHAZADO) {
          type = 'actividad_rechazada';
          title = 'Actividad rechazada';
          message = `ha rechazado tu actividad "${data.nombreactividad}".`;
        } else {
          type = 'actividad_observada';
          title = 'Actividad con observaciones';
          message = `ha dejado observaciones en tu actividad "${data.nombreactividad}".`;
        }
        const notification = {
          type,
          title,
          message,
          reviewedBy: {
            id: idCoordinadorRevisor,
            name: nombreRevisorDisplay,
            fotoPerfil: null as string | null,
          },
          idActividad: data.id,
          idJornada: data.idjornada,
          idProyecto: data.idproyecto,
          idTrabajador: data.idtrabajador,
          nombreActividad: data.nombreactividad,
          idEstadoActividad: input.idEstadoActividad,
          comentarioValidacion: input.comentarioValidacion ?? null,
          timestamp: new Date().toISOString(),
        };
        this.logger.log(
          `[NOTIF] ValidarActividad: notificando al trabajador userId=${idUsuarioTrabajador} type=${type}`,
        );
        await this.broadcastService.emitNotificationToUser(
          idUsuarioTrabajador,
          notification,
        );
      }
    } catch (error) {
      this.logger.error('Error al emitir notificación de validación:', error);
    }

    return data;
  }
}
