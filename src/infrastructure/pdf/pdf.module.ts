import { Global, Module } from '@nestjs/common';
import { HTML_PDF_GENERATOR } from 'src/domain/services/html-pdf-generator.interface';
import { HtmlPdfService } from './html-pdf.service';

/**
 * Módulo global de generación de PDF via Puppeteer + Handlebars.
 * Al ser @Global(), cualquier módulo que importe PdfModule puede inyectar
 * HTML_PDF_GENERATOR sin necesidad de re-declararlo como provider.
 */
@Global()
@Module({
  providers: [
    {
      provide: HTML_PDF_GENERATOR,
      useClass: HtmlPdfService,
    },
  ],
  exports: [HTML_PDF_GENERATOR],
})
export class PdfModule {}
