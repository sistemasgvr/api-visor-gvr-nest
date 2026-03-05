import { Injectable, Inject, Logger } from '@nestjs/common';
import { BroadcastGateway } from '../../presentation/gateways/broadcast.gateway';
import { NOTIFICACIONES_REPOSITORY } from '../../domain/repositories/notificaciones.repository.interface';
import type { INotificacionesRepository } from '../../domain/repositories/notificaciones.repository.interface';

/**
 * Servicio para emitir eventos de broadcasting
 * Usa el gateway de WebSocket para enviar eventos a los clientes conectados
 */
@Injectable()
export class BroadcastService {
  private readonly logger = new Logger(BroadcastService.name);

  constructor(
    private readonly broadcastGateway: BroadcastGateway,
    @Inject(NOTIFICACIONES_REPOSITORY)
    private readonly notificacionesRepository: INotificacionesRepository,
  ) {}

  /**
   * Emite un evento de menú creado
   */
  emitMenuCreated(menu: any) {
    // Emitir sin el punto inicial (Socket.IO no necesita el punto)
    // El frontend removerá el punto al escuchar
    this.broadcastGateway.emitToChannel('menus', 'menu.created', { menu });
  }

  /**
   * Emite un evento de menú actualizado
   */
  emitMenuUpdated(menu: any) {
    // Emitir sin el punto inicial (Socket.IO no necesita el punto)
    this.broadcastGateway.emitToChannel('menus', 'menu.updated', { menu });
  }

  /**
   * Emite un evento de menú eliminado
   */
  emitMenuDeleted(menuId: number) {
    // Emitir sin el punto inicial (Socket.IO no necesita el punto)
    this.broadcastGateway.emitToChannel('menus', 'menu.deleted', { menu_id: menuId });
  }

  /**
   * Emite un evento personalizado a un canal específico
   */
  emit(channel: string, event: string, data: any) {
    this.broadcastGateway.emitToChannel(channel, event, data);
  }

  /**
   * Emite un evento a todos los clientes conectados
   */
  emitToAll(event: string, data: any) {
    this.broadcastGateway.emitToAll(event, data);
  }

  /**
   * Notifica que el guardado del documento ha comenzado (Collabora acaba de llamar a PutFile).
   * El frontend muestra "Guardando..." hasta recibir document.saved.
   */
  emitDocumentSaveStarted(
    userId: number,
    data: { projectId: string; itemId: string; fileName: string },
  ) {
    this.broadcastGateway.emitToUser(userId, 'document.save_started', data);
    this.logger.log(`[DOC] document.save_started emitido a usuario ${userId} para ${data.fileName}`);
  }

  /**
   * Notifica a un usuario que su documento se guardó en ACC (Collabora PutFile exitoso).
   * El frontend (OfficeViewer) escucha el evento 'document.saved' y muestra un toast.
   */
  emitDocumentSaved(
    userId: number,
    data: { projectId: string; itemId: string; fileName: string },
  ) {
    this.broadcastGateway.emitToUser(userId, 'document.saved', data);
    this.logger.log(`[DOC] document.saved emitido a usuario ${userId} para ${data.fileName}`);
  }

  /**
   * Emite una notificación a un usuario específico.
   * Siempre persiste en BD (historial y entrega al abrir la app) y además emite por WebSocket si está conectado.
   * @param userId ID del usuario que recibirá la notificación (idusuario / auth)
   * @param notification Datos de la notificación (type, title, message, ...)
   */
  async emitNotificationToUser(userId: number, notification: any) {
    const tipo = notification.type || 'info';
    const titulo = notification.title || 'Notificación';
    const mensaje = notification.message ?? null;

    this.logger.log(
      `[NOTIF] Emitir notificación → userId=${userId} type=${tipo} title="${titulo?.substring(0, 40) ?? ''}"`,
    );

    try {
      // 1) Siempre guardar en BD para que aparezca en el sistema y al cargar pendientes
      const saved = await this.notificacionesRepository.guardarNotificacionPendiente(
        userId,
        tipo,
        titulo,
        mensaje,
        notification,
      );
      this.logger.log(`[NOTIF] Guardada en BD para userId=${userId} → id=${saved?.id ?? 'N/A'}`);
    } catch (err: any) {
      this.logger.error(`[NOTIF] Error al guardar en BD userId=${userId}: ${err?.message ?? err}`);
      throw err;
    }

    // 2) Si está conectado, enviar también por WebSocket
    const isConnected = this.broadcastGateway.isUserConnected(userId);
    this.logger.log(`[NOTIF] Usuario userId=${userId} conectado por socket: ${isConnected}`);
    if (isConnected) {
      const channel = `App.Models.User.${userId}`;
      this.broadcastGateway.emitToChannel(channel, 'notification', notification);
      this.logger.log(`[NOTIF] Emitido por socket al canal ${channel}`);
    }
  }
}

