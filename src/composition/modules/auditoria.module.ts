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

@Module({
  imports: [DatabaseModule],
  controllers: [AuditoriaController],
  providers: [
    ListarAuditoriasUseCase,
    ObtenerAuditoriaPorIdUseCase,
    ObtenerHistorialEntidadUseCase,
    ObtenerHistorialUsuarioUseCase,
    ObtenerEstadisticasUseCase,
    {
      provide: AUDITORIA_REPOSITORY,
      useClass: AuditoriaRepository,
    },
  ],
})
export class AuditoriaModule {}
