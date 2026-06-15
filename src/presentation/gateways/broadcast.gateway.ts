import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { IAuthRepository } from '../../domain/repositories/auth.repository.interface';
import { AUTH_REPOSITORY } from '../../domain/repositories/auth.repository.interface';

interface AuthenticatedSocket extends Socket {
  userId?: number;
  user?: any;
}

@WebSocketGateway({
  cors: {
    origin: true,
    credentials: true,
  },
  // Socket.IO usa el namespace por defecto '/' que se mapea a '/socket.io'
  // No especificar namespace usa el por defecto
  transports: ['websocket', 'polling'],
  allowEIO3: true, // Compatibilidad con versiones anteriores
  path: '/socket.io/', // Ruta explícita para Socket.IO
})
export class BroadcastGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(BroadcastGateway.name);
  private readonly connectedClients = new Map<string, AuthenticatedSocket>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: IAuthRepository,
  ) {
    this.logger.log('BroadcastGateway inicializado');
  }

  afterInit(server: Server) {
    this.logger.log(
      '✅ WebSocket Gateway inicializado y listo para conexiones',
    );
    this.logger.log(`📡 Servidor Socket.IO escuchando en: /socket.io/`);
  }

  async handleConnection(client: AuthenticatedSocket) {
    try {
      this.logger.log(`Nueva conexión intentada: ${client.id}`);
      this.logger.debug(`Handshake auth:`, client.handshake.auth);
      this.logger.debug(`Handshake query:`, client.handshake.query);
      this.logger.debug(
        `Handshake headers:`,
        client.handshake.headers.authorization,
      );

      // Extraer token del handshake
      const token = this.extractTokenFromSocket(client);

      if (!token) {
        this.logger.warn(`Cliente ${client.id} intentó conectar sin token`);
        this.logger.warn(`Auth object:`, client.handshake.auth);
        this.logger.warn(`Query params:`, client.handshake.query);
        client.disconnect();
        return;
      }

      this.logger.debug(`Token extraído para cliente ${client.id}`);

      // Verificar token (sub = idUsuario de auth, no idTrabajador)
      const payload = await this.jwtService.verifyAsync(token, {
        secret:
          this.configService.get<string>('JWT_SECRET') ||
          'default-secret-key-change-in-production',
      });

      const idUsuario =
        typeof payload.sub === 'number' ? payload.sub : Number(payload.sub);
      if (!Number.isInteger(idUsuario) || idUsuario < 1) {
        this.logger.warn(
          `JWT sub inválido para cliente ${client.id}: ${payload.sub}`,
        );
        client.disconnect();
        return;
      }

      client.userId = idUsuario;
      client.user = {
        id: idUsuario,
        correo: payload.correo,
        nombre: payload.nombre,
        roles: payload.roles,
        permisos: payload.permisos,
      };

      this.connectedClients.set(client.id, client);

      // Unir al canal privado del usuario por idUsuario (sesión) para que reciba notificaciones sin depender del "subscribe" del front
      const userChannel = `App.Models.User.${idUsuario}`;
      client.join(userChannel);
      this.logger.log(
        `✅ Cliente autenticado conectado: ${client.id} (idUsuario=${idUsuario}) → unido a ${userChannel}`,
      );

      try {
        await this.authRepository.setUsuarioConectado(idUsuario, true);
      } catch (err) {
        this.logger.warn(
          `No se pudo actualizar isconnected para usuario ${idUsuario}:`,
          err?.message,
        );
      }
    } catch (error) {
      this.logger.error(
        `❌ Error al autenticar cliente ${client.id}:`,
        error.message || error,
      );
      if (error.stack) {
        this.logger.error(`Stack trace:`, error.stack);
      }
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    const userId = client.userId;
    this.connectedClients.delete(client.id);
    if (userId != null) {
      const tieneOtraConexion = Array.from(this.connectedClients.values()).some(
        (c) => c.userId === userId,
      );
      if (!tieneOtraConexion) {
        this.authRepository.setUsuarioConectado(userId, false).catch((err) => {
          this.logger.warn(
            `No se pudo actualizar isconnected=false para usuario ${userId}:`,
            err?.message,
          );
        });
      }
    }
    this.logger.log(`Cliente desconectado: ${client.id}`);
  }

  /**
   * Suscripción a un canal público
   */
  @SubscribeMessage('subscribe')
  handleSubscribe(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { channel: string },
  ) {
    if (!client.userId) {
      this.logger.warn(
        `Cliente ${client.id} intentó suscribirse sin autenticación`,
      );
      return { success: false, error: 'Usuario no autenticado' };
    }

    const { channel } = data;

    // Verificar que el canal sea público o que el usuario tenga permisos
    if (this.canSubscribeToChannel(client, channel)) {
      client.join(channel);
      this.logger.log(`Cliente ${client.id} suscrito al canal: ${channel}`);
      return { success: true, channel };
    } else {
      this.logger.warn(
        `Cliente ${client.id} intentó suscribirse a canal no autorizado: ${channel}`,
      );
      return { success: false, error: 'No autorizado para este canal' };
    }
  }

  /**
   * Desuscripción de un canal
   */
  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { channel: string },
  ) {
    const { channel } = data;
    client.leave(channel);
    this.logger.log(`Cliente ${client.id} desuscrito del canal: ${channel}`);
    return { success: true, channel };
  }

  /**
   * Emite un evento a un canal específico
   */
  emitToChannel(channel: string, event: string, data: any) {
    this.server.to(channel).emit(event, data);
    this.logger.log(`Evento '${event}' emitido al canal '${channel}'`);
  }

  /**
   * Emite un evento a todos los clientes conectados
   */
  emitToAll(event: string, data: any) {
    this.server.emit(event, data);
    this.logger.log(`Evento '${event}' emitido a todos los clientes`);
  }

  /**
   * Verifica si un usuario puede suscribirse a un canal
   */
  private canSubscribeToChannel(
    client: AuthenticatedSocket,
    channel: string,
  ): boolean {
    // Canal público 'menus' - cualquier usuario autenticado puede suscribirse
    if (channel === 'menus') {
      return true;
    }

    // Marcas de revisión del visor ACC por proyecto
    if (/^acc\.projects\.[^.]+\.visor-marcas-revision$/.test(channel)) {
      return true;
    }

    // Canal privado por usuario: 'App.Models.User.{id}'
    const userChannelMatch = channel.match(/^App\.Models\.User\.(\d+)$/);
    if (userChannelMatch) {
      const userId = parseInt(userChannelMatch[1], 10);
      return client.userId === userId;
    }

    // Por defecto, denegar
    return false;
  }

  /**
   * Emite un evento directamente a un usuario específico por su ID
   */
  emitToUser(userId: number, event: string, data: any) {
    const channel = `App.Models.User.${userId}`;
    this.emitToChannel(channel, event, data);
    this.logger.log(`Evento '${event}' emitido al usuario ${userId}`);
  }

  /**
   * Verifica si un usuario está conectado
   */
  isUserConnected(userId: number): boolean {
    const channel = `App.Models.User.${userId}`;
    const room = this.server.sockets.adapter.rooms.get(channel);
    return room ? room.size > 0 : false;
  }

  /**
   * Extrae el token JWT del socket
   */
  private extractTokenFromSocket(client: Socket): string | null {
    // Intentar obtener el token de socket.auth (configurado en el cliente)
    const authToken = (client.handshake.auth as any)?.token;
    if (authToken) {
      return authToken;
    }

    // Intentar obtener el token del query string
    const token = client.handshake.query.token as string;
    if (token) {
      return token;
    }

    // Intentar obtener el token del header Authorization
    const authHeader = client.handshake.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    return null;
  }
}
