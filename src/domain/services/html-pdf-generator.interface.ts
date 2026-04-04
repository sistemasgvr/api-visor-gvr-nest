export const HTML_PDF_GENERATOR = Symbol('HTML_PDF_GENERATOR');

export interface IHtmlPdfGenerator {
  renderPdfFromTemplate(
    templateName: string,
    data: Record<string, unknown>,
  ): Promise<Buffer>;
}
