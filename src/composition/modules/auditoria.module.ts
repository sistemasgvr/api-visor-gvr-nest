import { Module } from '@nestjs/common';
import {
  ListarAuditoriasUseCase,
  ObtenerAuditoriaPorIdUseCase,
  ObtenerEstadisticasUseCase,
  ObtenerHistorialEntidadUseCase,
  ObtenerHistorialUsuarioUseCase,
} from '../../application/use-cases/auditoria';
import { AUDITORIA_REPOSITORY } from '../../domain/repositories/auditoria.repository.interface';
import { AuditoriaRepository } from '../../infrastructure/repositories/auditoria.repository';
import { AuditoriaController } from '../../presentation/controllers/auditoria.controller';
import { DatabaseModule } from './platform/database.module';
import { applicationProvider } from '../application.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [AuditoriaController],
  providers: [
    applicationProvider(ListarAuditoriasUseCase),
    applicationProvider(ObtenerAuditoriaPorIdUseCase),
    applicationProvider(ObtenerHistorialEntidadUseCase),
    applicationProvider(ObtenerHistorialUsuarioUseCase),
    applicationProvider(ObtenerEstadisticasUseCase),
    {
      provide: AUDITORIA_REPOSITORY,
      useClass: AuditoriaRepository,
    },
  ],
})
export class AuditoriaModule {}
