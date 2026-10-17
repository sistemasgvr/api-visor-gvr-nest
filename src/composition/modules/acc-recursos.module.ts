import { Module } from '@nestjs/common';
import {
  ActualizarRecursoUseCase,
  GuardarRecursoUseCase,
  ObtenerRecursosHijosUseCase,
  ObtenerRecursosProyectoUseCase,
  ObtenerRecursosUsuarioUseCase,
  ObtenerRecursoUseCase,
} from '../../application/use-cases/acc-recursos';
import { ACC_RECURSOS_REPOSITORY } from '../../domain/repositories/acc-recursos.repository.interface';
import { AUDITORIA_REPOSITORY } from '../../domain/repositories/auditoria.repository.interface';
import { AccRecursosRepository } from '../../infrastructure/repositories/acc-recursos.repository';
import { AuditoriaRepository } from '../../infrastructure/repositories/auditoria.repository';
import { AccRecursosController } from '../../presentation/controllers/acc-recursos.controller';
import { DatabaseModule } from './platform/database.module';

import { applicationProvider } from '../application.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [AccRecursosController],
  providers: [
    applicationProvider(GuardarRecursoUseCase),
    applicationProvider(ObtenerRecursoUseCase),
    applicationProvider(ActualizarRecursoUseCase),
    applicationProvider(ObtenerRecursosUsuarioUseCase),
    applicationProvider(ObtenerRecursosProyectoUseCase),
    applicationProvider(ObtenerRecursosHijosUseCase),
    {
      provide: ACC_RECURSOS_REPOSITORY,
      useClass: AccRecursosRepository,
    },
    {
      provide: AUDITORIA_REPOSITORY,
      useClass: AuditoriaRepository,
    },
  ],
})
export class AccRecursosModule {}
