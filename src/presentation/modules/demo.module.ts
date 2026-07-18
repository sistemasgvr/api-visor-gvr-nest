import { Module } from '@nestjs/common';
import { GenerarPdfDemoUseCase } from 'src/application/use-cases/pdf/generar-pdf-demo.use-case';
import { EnviarCorreoBienvenidaDemoUseCase } from 'src/application/use-cases/demo/enviar-correo-bienvenida-demo.use-case';
import { DemoController } from '../controllers/demo.controller';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { StorageModule } from '../../infrastructure/storage/storage.module';
import { TrabajadorRepository } from '../../infrastructure/repositories/trabajador.repository';
import { TRABAJADOR_REPOSITORY } from '../../domain/repositories/trabajador.repository.interface';

/** Módulo de rutas de prueba / sandbox (sin auth). */
@Module({
  imports: [DatabaseModule, StorageModule],
  controllers: [DemoController],
  providers: [
    {
      provide: TRABAJADOR_REPOSITORY,
      useClass: TrabajadorRepository,
    },
    GenerarPdfDemoUseCase,
    EnviarCorreoBienvenidaDemoUseCase,
  ],
})
export class DemoModule {}
