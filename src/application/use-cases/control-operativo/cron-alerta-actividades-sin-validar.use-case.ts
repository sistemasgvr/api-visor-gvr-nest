import { Injectable, Inject, Logger } from '@nestjs/common';
import type {
  IControlOperativoRepository,
  CronAlertaActividadesSinValidarResult,
  GrupoCoordinadorSinValidar,
} from '../../../domain/repositories/control-operativo.repository.interface';
import { CONTROL_OPERATIVO_REPOSITORY } from '../../../domain/repositories/control-operativo.repository.interface';
import { BroadcastService } from '../../../shared/services/broadcast.service';

@Injectable()
export class CronAlertaActividadesSinValidarUseCase {
  private readonly logger = new Logger(
    CronAlertaActividadesSinValidarUseCase.name,
  );

  constructor(
    @Inject(CONTROL_OPERATIVO_REPOSITORY)
    private readonly controlOperativoRepository: IControlOperativoRepository,
    private readonly broadcastService: BroadcastService,
  ) {}

  /**
   * Detecta actividades "Por Aprobar" con más de 7 días desde su registro,
   * agrupa por coordinador responsable e indica su responsable directo.
   * Notifica vía WebSocket + persistencia a todos los usuarios con roles
   * Administrador (1), Gerencia (5) y Administrador GVR (11), enviando
   * UNA notificación por coordinador para que quede claro quién debe validar.
   */
  async execute(fecha: string): Promise<CronAlertaActividadesSinValidarResult> {
    const f = fecha?.trim();
    if (!f || !/^\d{4}-\d{2}-\d{2}$/.test(f)) {
      throw new Error('Fecha inválida; use formato YYYY-MM-DD');
    }

    const result =
      await this.controlOperativoRepository.ejecutarCronAlertaActividadesSinValidar(
        f,
      );

    this.logger.log(
      `[CRON-ALERTA] Fecha=${f} | Actividades vencidas: ${result.totalActividades} | Grupos coordinadores: ${result.gruposCoordinadores.length} | Usuarios a notificar: ${result.usuariosANotificar.length}`,
    );

    if (
      result.totalActividades === 0 ||
      result.usuariosANotificar.length === 0
    ) {
      return result;
    }

    // Enviar una notificación por coordinador a cada usuario admin/gerencia
    const sendPromises: Promise<void>[] = [];

    for (const grupo of result.gruposCoordinadores) {
      const notification = this.buildNotification(grupo);

      for (const userId of result.usuariosANotificar) {
        sendPromises.push(
          this.broadcastService
            .emitNotificationToUser(userId, notification)
            .then(() => {
              this.logger.log(
                `[CRON-ALERTA] Notificación coordinador="${grupo.nombreCoordinador}" → userId=${userId}`,
              );
            })
            .catch((err: unknown) => {
              const msg = err instanceof Error ? err.message : String(err);
              this.logger.error(
                `[CRON-ALERTA] Error al notificar userId=${userId} grupo="${grupo.nombreCoordinador}": ${msg}`,
              );
            }),
        );
      }
    }

    await Promise.all(sendPromises);

    return result;
  }

  private buildNotification(
    grupo: GrupoCoordinadorSinValidar,
  ): Record<string, unknown> {
    const n = grupo.cantidad;
    const actividades = n === 1 ? '1 actividad' : `${n} actividades`;
    const responsableInfo = grupo.nombreResponsable
      ? ` Responsable directo: ${grupo.nombreResponsable}.`
      : '';

    return {
      type: 'actividad_sin_validar',
      title: 'Actividades sin validar',
      message: `tiene ${actividades} sin validar (hace más de 7 días).${responsableInfo}`,
      coordinador: {
        id: grupo.idCoordinador,
        nombre: grupo.nombreCoordinador,
        idUsuario: grupo.idUsuarioCoordinador,
      },
      responsable: grupo.nombreResponsable
        ? {
            id: grupo.idResponsable,
            nombre: grupo.nombreResponsable,
            idUsuario: grupo.idUsuarioResponsable,
          }
        : null,
      cantidadActividades: grupo.cantidad,
      actividades: grupo.actividades,
      timestamp: new Date().toISOString(),
    };
  }
}
