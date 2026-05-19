import {
  Injectable,
  Inject,
  Logger,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import type {
  IControlOperativoRepository,
  ValidarActividadParams,
  ActividadCreada,
} from '../../../domain/repositories/control-operativo.repository.interface';
import { CONTROL_OPERATIVO_REPOSITORY } from '../../../domain/repositories/control-operativo.repository.interface';
import type { IAuthRepository } from '../../../domain/repositories/auth.repository.interface';
import { AUTH_REPOSITORY } from '../../../domain/repositories/auth.repository.interface';
import { BroadcastService } from '../../../shared/services/broadcast.service';
import { esAccesoTotalValidacionActividades } from './validacion-acceso.util';

/** Estados de validación: 375 Aprobado, 376 Observado, 377 Rechazado */
const ESTADO_APROBADO = 375;
const ESTADO_OBSERVADO = 376;
const ESTADO_RECHAZADO = 377;

export interface ValidarActividadInput {
  idActividad: number;
  idEstadoActividad: number;
  comentarioValidacion?: string | null;
  idUsuario: number;
}

@Injectable()
export class ValidarActividadUseCase {
  private readonly logger = new Logger(ValidarActividadUseCase.name);

  constructor(
    @Inject(CONTROL_OPERATIVO_REPOSITORY)
    private readonly controlOperativoRepository: IControlOperativoRepository,
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: IAuthRepository,
    private readonly broadcastService: BroadcastService,
  ) {}

  async execute(input: ValidarActividadInput): Promise<ActividadCreada | null> {
    const perfil = await this.authRepository.obtenerPerfilUsuario(
      input.idUsuario,
    );
    if (!perfil?.roles || !Array.isArray(perfil.roles)) {
      throw new UnauthorizedException('Usuario no identificado');
    }
    const rolesIds = (perfil.roles as { id?: number }[])
      .map((r) => r?.id)
      .filter((id): id is number => id != null);
    const esAdminTotalValidacion = esAccesoTotalValidacionActividades(rolesIds);

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
      throw new ForbiddenException(
        'No tiene permiso para validar esta actividad',
      );
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
        if (input.idEstadoActividad === ESTADO_APROBADO) {
          type = 'actividad_aprobada';
          title = 'Actividad aprobada';
          message = `ha aprobado tu actividad "${data.nombreactividad}".`;
        } else if (input.idEstadoActividad === ESTADO_RECHAZADO) {
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
