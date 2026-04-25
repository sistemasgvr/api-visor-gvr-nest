import {
  Controller,
  Get,
  Post,
  Delete,
  UseGuards,
  Request,
  Query,
  Param,
  ParseIntPipe,
  Logger,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard';
import { ObtenerNotificacionesPendientesUseCase } from '../../application/use-cases/notificaciones/obtener-notificaciones-pendientes.use-case';
import { ObtenerNotificacionesUseCase } from '../../application/use-cases/notificaciones/obtener-notificaciones.use-case';
import { MarcarNotificacionesEntregadasUseCase } from '../../application/use-cases/notificaciones/marcar-notificaciones-entregadas.use-case';
import { EliminarNotificacionUseCase } from '../../application/use-cases/notificaciones/eliminar-notificacion.use-case';
import { EliminarTodasNotificacionesUseCase } from '../../application/use-cases/notificaciones/eliminar-todas-notificaciones.use-case';

@Controller('notificaciones')
@UseGuards(JwtAuthGuard)
export class NotificacionesController {
  private readonly logger = new Logger(NotificacionesController.name);

  constructor(
    private readonly obtenerNotificacionesPendientesUseCase: ObtenerNotificacionesPendientesUseCase,
    private readonly obtenerNotificacionesUseCase: ObtenerNotificacionesUseCase,
    private readonly marcarNotificacionesEntregadasUseCase: MarcarNotificacionesEntregadasUseCase,
    private readonly eliminarNotificacionUseCase: EliminarNotificacionUseCase,
    private readonly eliminarTodasNotificacionesUseCase: EliminarTodasNotificacionesUseCase,
  ) {}

  @Get('pendientes')
  async obtenerPendientes(@Request() req: any, @Query('tipo') tipo?: string) {
    const raw = req.user?.sub ?? req.user?.id ?? req.user?.idusuario;
    const userId = typeof raw === 'number' ? raw : Number(raw);
    this.logger.log(
      `[NOTIF] GET /pendientes → raw=${raw} userId=${userId} tipo=${tipo ?? 'todos'}`,
    );
    if (!Number.isInteger(userId) || userId < 1) {
      this.logger.warn(`[NOTIF] GET /pendientes rechazado: usuario no válido`);
      return { status: 400, message: 'Usuario no válido', data: [] };
    }
    const notificaciones =
      await this.obtenerNotificacionesPendientesUseCase.execute(userId, tipo);
    this.logger.log(
      `[NOTIF] GET /pendientes → userId=${userId} devuelve ${notificaciones?.length ?? 0} notificaciones`,
    );
    return {
      status: 200,
      message: 'Notificaciones pendientes obtenidas exitosamente',
      data: notificaciones,
    };
  }

  @Post('marcar-entregadas')
  async marcarEntregadas(@Request() req: any) {
    const raw = req.user?.sub ?? req.user?.id ?? req.user?.idusuario;
    const userId = typeof raw === 'number' ? raw : Number(raw);
    this.logger.log(
      `[NOTIF] POST /marcar-entregadas → raw=${raw} userId=${userId}`,
    );
    if (!Number.isInteger(userId) || userId < 1) {
      this.logger.warn(
        `[NOTIF] POST /marcar-entregadas rechazado: usuario no válido`,
      );
      return { status: 400, message: 'Usuario no válido' };
    }
    await this.marcarNotificacionesEntregadasUseCase.execute(userId);
    this.logger.log(`[NOTIF] POST /marcar-entregadas → userId=${userId} OK`);
    return {
      status: 200,
      message: 'Notificaciones marcadas como entregadas exitosamente',
    };
  }

  /** Lista todas las notificaciones del usuario (pendientes y entregadas), estado = 1 */
  @Get()
  async listar(@Request() req: any, @Query('tipo') tipo?: string) {
    const raw = req.user?.sub ?? req.user?.id ?? req.user?.idusuario;
    const userId = typeof raw === 'number' ? raw : Number(raw);
    if (!Number.isInteger(userId) || userId < 1) {
      return { status: 400, message: 'Usuario no válido', data: [] };
    }
    const notificaciones = await this.obtenerNotificacionesUseCase.execute(
      userId,
      tipo,
    );
    this.logger.log(
      `[NOTIF] GET / → userId=${userId} devuelve ${notificaciones?.length ?? 0}`,
    );
    return {
      status: 200,
      message: 'Notificaciones obtenidas exitosamente',
      data: notificaciones,
    };
  }

  /** Soft delete de una notificación. id en URL es el id de BD (sin prefijo notif-). */
  @Delete(':id')
  async eliminar(@Request() req: any, @Param('id', ParseIntPipe) id: number) {
    const raw = req.user?.sub ?? req.user?.id ?? req.user?.idusuario;
    const userId = typeof raw === 'number' ? raw : Number(raw);
    if (!Number.isInteger(userId) || userId < 1) {
      return { status: 400, message: 'Usuario no válido' };
    }
    await this.eliminarNotificacionUseCase.execute(id, userId);
    this.logger.log(`[NOTIF] DELETE /${id} → userId=${userId} OK`);
    return {
      status: 200,
      message: 'Notificación eliminada',
    };
  }

  /** Soft delete de todas las notificaciones del usuario */
  @Delete()
  async eliminarTodas(@Request() req: any) {
    const raw = req.user?.sub ?? req.user?.id ?? req.user?.idusuario;
    const userId = typeof raw === 'number' ? raw : Number(raw);
    if (!Number.isInteger(userId) || userId < 1) {
      return { status: 400, message: 'Usuario no válido' };
    }
    await this.eliminarTodasNotificacionesUseCase.execute(userId);
    this.logger.log(`[NOTIF] DELETE / (todas) → userId=${userId} OK`);
    return {
      status: 200,
      message: 'Notificaciones eliminadas',
    };
  }
}
