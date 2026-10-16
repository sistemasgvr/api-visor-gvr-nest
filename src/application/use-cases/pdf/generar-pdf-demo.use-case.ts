import type { IHtmlPdfGenerator } from '../../ports/html-pdf-generator.interface';

export interface GenerarPdfDemoInput {
  titulo?: string;
  items?: { concepto: string; valor: string }[];
}

export class GenerarPdfDemoUseCase {
  constructor(private readonly htmlPdfGenerator: IHtmlPdfGenerator) {}

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
