import { Logger } from '@nestjs/common';
import type { IProyectoRepository } from '../../../domain/repositories/proyecto.repository.interface';
import type { BroadcastService } from '../../../shared/services/broadcast.service';

const logger = new Logger('EntregableNotificaciones');

/**
 * Notifica al colaborador asignado (skip si el responsable es el mismo usuario que actúa).
 */
export async function emitirEntregableAsignado(params: {
  broadcast: BroadcastService;
  proyectoRepository: IProyectoRepository;
  idEntregable: number;
  nombreEntregable: string;
  idProyecto: number;
  nombreProyecto?: string | null;
  idTrabajadorResponsable: number;
  idUsuarioActor: number;
  idTrabajadorActor?: number | null;
  fechaEstimada?: string | null;
}): Promise<void> {
  try {
    const {
      broadcast,
      proyectoRepository,
      idTrabajadorResponsable,
      idUsuarioActor,
      idTrabajadorActor,
    } = params;

    if (
      idTrabajadorActor != null &&
      Number(idTrabajadorActor) === Number(idTrabajadorResponsable)
    ) {
      return;
    }

    const idUsuarioResponsable =
      await proyectoRepository.obtenerIdUsuarioPorIdTrabajador(
        idTrabajadorResponsable,
      );
    if (idUsuarioResponsable == null) {
      logger.warn(
        `[NOTIF] entregable_asignado: sin idusuario para trabajador=${idTrabajadorResponsable}`,
      );
      return;
    }
    if (Number(idUsuarioResponsable) === Number(idUsuarioActor)) {
      return;
    }

    const nombreActor =
      idTrabajadorActor != null
        ? await proyectoRepository.obtenerNombreTrabajadorPorId(
            idTrabajadorActor,
          )
        : null;

    const notification = {
      type: 'entregable_asignado',
      title: 'Entregable asignado',
      message: `te asignó el entregable "${params.nombreEntregable}".`,
      assignedBy: {
        id: idUsuarioActor,
        name: nombreActor?.trim() || 'Un usuario',
        fotoPerfil: null as string | null,
      },
      idEntregable: params.idEntregable,
      nombreEntregable: params.nombreEntregable,
      idProyecto: params.idProyecto,
      nombreProyecto: params.nombreProyecto ?? null,
      fechaEstimada: params.fechaEstimada ?? null,
      timestamp: new Date().toISOString(),
    };

    logger.log(
      `[NOTIF] entregable_asignado → userId=${idUsuarioResponsable} idEntregable=${params.idEntregable}`,
    );
    await broadcast.emitNotificationToUser(idUsuarioResponsable, notification);
  } catch (error) {
    logger.error('Error al emitir entregable_asignado', error);
  }
}

/**
 * Notifica al creador del entregable cuando se marca culminado vía actividad.
 */
export async function emitirEntregableCulminado(params: {
  broadcast: BroadcastService;
  proyectoRepository: IProyectoRepository;
  idEntregable: number;
  idUsuarioActor: number;
  idTrabajadorActor?: number | null;
  nombreActividad?: string | null;
}): Promise<void> {
  try {
    const entregable = await params.proyectoRepository.obtenerEntregablePorId(
      params.idEntregable,
    );
    if (!entregable) return;

    const idUsuarioCreador =
      entregable.idusuariocreacion != null
        ? Number(entregable.idusuariocreacion)
        : null;
    if (idUsuarioCreador == null || idUsuarioCreador < 1) {
      logger.warn(
        `[NOTIF] entregable_culminado: entregable=${params.idEntregable} sin idusuariocreacion`,
      );
      return;
    }
    if (Number(idUsuarioCreador) === Number(params.idUsuarioActor)) {
      return;
    }

    const nombreActor =
      params.idTrabajadorActor != null
        ? await params.proyectoRepository.obtenerNombreTrabajadorPorId(
            params.idTrabajadorActor,
          )
        : null;

    const nombreEntregable =
      String(entregable.nombre ?? '').trim() || `Entregable #${params.idEntregable}`;

    const notification = {
      type: 'entregable_culminado',
      title: 'Entregable culminado',
      message: `marcó como culminado el entregable "${nombreEntregable}".`,
      completedBy: {
        id: params.idUsuarioActor,
        name: nombreActor?.trim() || 'Un usuario',
        fotoPerfil: null as string | null,
      },
      idEntregable: params.idEntregable,
      nombreEntregable,
      idProyecto: Number(entregable.idproyecto),
      nombreProyecto: entregable.nombreproyecto ?? null,
      idActividad: undefined as number | undefined,
      nombreActividad: params.nombreActividad ?? null,
      timestamp: new Date().toISOString(),
    };

    logger.log(
      `[NOTIF] entregable_culminado → userId=${idUsuarioCreador} idEntregable=${params.idEntregable}`,
    );
    await params.broadcast.emitNotificationToUser(
      idUsuarioCreador,
      notification,
    );
  } catch (error) {
    logger.error('Error al emitir entregable_culminado', error);
  }
}
