import { Module } from '@nestjs/common';
import { EnviarCorreoBienvenidaDemoUseCase } from '../../application/use-cases/demo/enviar-correo-bienvenida-demo.use-case';
import { GenerarPdfDemoUseCase } from '../../application/use-cases/pdf/generar-pdf-demo.use-case';
import { TRABAJADOR_REPOSITORY } from '../../domain/repositories/trabajador.repository.interface';
import { TrabajadorRepository } from '../../infrastructure/repositories/trabajador.repository';
import { DemoController } from '../../presentation/controllers/demo.controller';
import { applicationProvider } from '../application.providers';
import { DatabaseModule } from './platform/database.module';
import { StorageModule } from './platform/storage.module';

/** Módulo de rutas de prueba / sandbox (sin auth). */
@Module({
  imports: [DatabaseModule, StorageModule],
  controllers: [DemoController],
  providers: [
    {
      provide: TRABAJADOR_REPOSITORY,
      useClass: TrabajadorRepository,
    },
    applicationProvider(GenerarPdfDemoUseCase),
    applicationProvider(EnviarCorreoBienvenidaDemoUseCase),
  ],
})
export class DemoModule {}
