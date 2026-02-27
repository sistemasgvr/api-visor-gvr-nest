import { Controller, Get, Post, UseGuards, Request, Query, Logger } from '@nestjs/common';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard';
import { ObtenerNotificacionesPendientesUseCase } from '../../application/use-cases/notificaciones/obtener-notificaciones-pendientes.use-case';
import { MarcarNotificacionesEntregadasUseCase } from '../../application/use-cases/notificaciones/marcar-notificaciones-entregadas.use-case';

@Controller('notificaciones')
@UseGuards(JwtAuthGuard)
export class NotificacionesController {
    private readonly logger = new Logger(NotificacionesController.name);

    constructor(
        private readonly obtenerNotificacionesPendientesUseCase: ObtenerNotificacionesPendientesUseCase,
        private readonly marcarNotificacionesEntregadasUseCase: MarcarNotificacionesEntregadasUseCase,
    ) {}

    @Get('pendientes')
    async obtenerPendientes(@Request() req: any, @Query('tipo') tipo?: string) {
        const raw = req.user?.sub ?? req.user?.id ?? req.user?.idusuario;
        const userId = typeof raw === 'number' ? raw : Number(raw);
        this.logger.log(`[NOTIF] GET /pendientes → raw=${raw} userId=${userId} tipo=${tipo ?? 'todos'}`);
        if (!Number.isInteger(userId) || userId < 1) {
            this.logger.warn(`[NOTIF] GET /pendientes rechazado: usuario no válido`);
            return { status: 400, message: 'Usuario no válido', data: [] };
        }
        const notificaciones = await this.obtenerNotificacionesPendientesUseCase.execute(userId, tipo);
        this.logger.log(`[NOTIF] GET /pendientes → userId=${userId} devuelve ${notificaciones?.length ?? 0} notificaciones`);
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
        this.logger.log(`[NOTIF] POST /marcar-entregadas → raw=${raw} userId=${userId}`);
        if (!Number.isInteger(userId) || userId < 1) {
            this.logger.warn(`[NOTIF] POST /marcar-entregadas rechazado: usuario no válido`);
            return { status: 400, message: 'Usuario no válido' };
        }
        await this.marcarNotificacionesEntregadasUseCase.execute(userId);
        this.logger.log(`[NOTIF] POST /marcar-entregadas → userId=${userId} OK`);
        return {
            status: 200,
            message: 'Notificaciones marcadas como entregadas exitosamente',
        };
    }
}

