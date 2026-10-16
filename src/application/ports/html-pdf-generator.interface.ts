export const HTML_PDF_GENERATOR = Symbol('HTML_PDF_GENERATOR');

export interface PdfRenderOptions {
  format?: 'A4' | 'Letter';
  /** Modo horizontal (útil para tablas anchas). */
  landscape?: boolean;
  displayHeaderFooter?: boolean;
  headerTemplate?: string;
  footerTemplate?: string;
  margin?: { top: string; right: string; bottom: string; left: string };
}

export interface IHtmlPdfGenerator {
  renderPdfFromTemplate(
    templateName: string,
    data: Record<string, unknown>,
    options?: PdfRenderOptions,
  ): Promise<Buffer>;
}
