import { Inject, Injectable } from '@nestjs/common';
import { HTML_PDF_GENERATOR } from 'src/domain/services/html-pdf-generator.interface';
import type { IHtmlPdfGenerator } from 'src/domain/services/html-pdf-generator.interface';

export interface GenerarPdfDemoInput {
  titulo?: string;
  items?: { concepto: string; valor: string }[];
}

@Injectable()
export class GenerarPdfDemoUseCase {
  constructor(
    @Inject(HTML_PDF_GENERATOR)
    private readonly htmlPdfGenerator: IHtmlPdfGenerator,
  ) {}

  async execute(input?: GenerarPdfDemoInput): Promise<Buffer> {
    const titulo = input?.titulo?.trim() || 'Informe de prueba (Visor GVR)';
    const items =
      input?.items && input.items.length > 0
        ? input.items
        : [
            { concepto: 'Plantilla HTML + Handlebars', valor: 'OK' },
            { concepto: 'Render con Puppeteer', valor: 'OK' },
          ];

    return this.htmlPdfGenerator.renderPdfFromTemplate('sample-report', {
      titulo,
      subtitulo: 'Ejemplo de exportación PDF desde plantilla',
      generatedAt: new Date().toLocaleString('es-ES', {
        dateStyle: 'short',
        timeStyle: 'short',
      }),
      items,
    });
  }
}
