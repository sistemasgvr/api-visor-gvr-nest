import { Module } from '@nestjs/common';
import { HTML_PDF_GENERATOR } from 'src/domain/services/html-pdf-generator.interface';
import { HtmlPdfService } from 'src/infrastructure/pdf/html-pdf.service';
import { GenerarPdfDemoUseCase } from 'src/application/use-cases/pdf/generar-pdf-demo.use-case';
import { EnviarCorreoBienvenidaDemoUseCase } from 'src/application/use-cases/demo/enviar-correo-bienvenida-demo.use-case';
import { DemoController } from '../controllers/demo.controller';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { TrabajadorRepository } from '../../infrastructure/repositories/trabajador.repository';
import { TRABAJADOR_REPOSITORY } from '../../domain/repositories/trabajador.repository.interface';

/** Módulo de rutas de prueba / sandbox (sin auth). */
@Module({
  imports: [DatabaseModule],
  controllers: [DemoController],
  providers: [
    {
      provide: HTML_PDF_GENERATOR,
      useClass: HtmlPdfService,
    },
    {
      provide: TRABAJADOR_REPOSITORY,
      useClass: TrabajadorRepository,
    },
    GenerarPdfDemoUseCase,
    EnviarCorreoBienvenidaDemoUseCase,
  ],
})
export class DemoModule {}
