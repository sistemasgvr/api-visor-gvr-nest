import { Module } from '@nestjs/common';
import { EliminarNotificacionUseCase } from '../../application/use-cases/notificaciones/eliminar-notificacion.use-case';
import { EliminarTodasNotificacionesUseCase } from '../../application/use-cases/notificaciones/eliminar-todas-notificaciones.use-case';
import { MarcarNotificacionesEntregadasUseCase } from '../../application/use-cases/notificaciones/marcar-notificaciones-entregadas.use-case';
import { ObtenerNotificacionesPendientesUseCase } from '../../application/use-cases/notificaciones/obtener-notificaciones-pendientes.use-case';
import { ObtenerNotificacionesUseCase } from '../../application/use-cases/notificaciones/obtener-notificaciones.use-case';
import { NOTIFICACIONES_REPOSITORY } from '../../domain/repositories/notificaciones.repository.interface';
import { DatabaseFunctionService } from '../../infrastructure/database/database-function.service';
import { NotificacionesRepository } from '../../infrastructure/repositories/notificaciones.repository';
import { NotificacionesController } from '../../presentation/controllers/notificaciones.controller';
import { applicationProvider } from '../application.providers';

@Module({
  controllers: [NotificacionesController],
  providers: [
    applicationProvider(ObtenerNotificacionesPendientesUseCase),
    applicationProvider(ObtenerNotificacionesUseCase),
    applicationProvider(MarcarNotificacionesEntregadasUseCase),
    applicationProvider(EliminarNotificacionUseCase),
    applicationProvider(EliminarTodasNotificacionesUseCase),
    DatabaseFunctionService,
    {
      provide: NOTIFICACIONES_REPOSITORY,
      useClass: NotificacionesRepository,
    },
  ],
})
export class NotificacionesModule {}
