import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { NOTIFICACIONES_REPOSITORY } from '../../domain/repositories/notificaciones.repository.interface';
import { DatabaseFunctionService } from '../../infrastructure/database/database-function.service';
import { BroadcastService } from '../../infrastructure/events/broadcast.service';
import { NotificacionesRepository } from '../../infrastructure/repositories/notificaciones.repository';
import { BroadcastController } from '../../presentation/controllers/broadcast.controller';
import { BroadcastGateway } from '../../presentation/gateways/broadcast.gateway';
import { AuthModule } from './auth.module';

@Module({
  imports: [JwtModule, ConfigModule, AuthModule],
  controllers: [BroadcastController],
  providers: [
    BroadcastGateway,
    BroadcastService,
    DatabaseFunctionService,
    {
      provide: NOTIFICACIONES_REPOSITORY,
      useClass: NotificacionesRepository,
    },
  ],
  exports: [BroadcastService],
})
export class BroadcastModule {}
