import { Module } from '@nestjs/common';
import { HTML_PDF_GENERATOR } from 'src/domain/services/html-pdf-generator.interface';
import { HtmlPdfService } from 'src/infrastructure/pdf/html-pdf.service';
import { GenerarPdfDemoUseCase } from 'src/application/use-cases/pdf/generar-pdf-demo.use-case';
import { DemoController } from '../controllers/demo.controller';

@Module({
  controllers: [DemoController],
  providers: [
    {
      provide: HTML_PDF_GENERATOR,
      useClass: HtmlPdfService,
    },
    GenerarPdfDemoUseCase,
  ],
  exports: [HTML_PDF_GENERATOR, GenerarPdfDemoUseCase],
})
export class DemoModule {}
