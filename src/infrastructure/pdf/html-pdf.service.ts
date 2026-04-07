import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
  BadRequestException,
} from '@nestjs/common';
import { readFile } from 'fs/promises';
import { basename, join } from 'path';
import * as handlebars from 'handlebars';
import puppeteer, { Browser } from 'puppeteer';
import type {
  IHtmlPdfGenerator,
  PdfRenderOptions,
} from 'src/domain/services/html-pdf-generator.interface';

/** Genera PDFs desde plantillas HTML con Handlebars. Lanza Chromium al iniciar. */
@Injectable()
export class HtmlPdfService
  implements IHtmlPdfGenerator, OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(HtmlPdfService.name);
  private browser: Browser | null = null;

  private get templatesDir(): string {
    return join(__dirname, 'templates');
  }

  async onModuleInit(): Promise<void> {
    const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH?.trim();
    this.browser = await puppeteer.launch({
      headless: true,
      ...(executablePath ? { executablePath } : {}),
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    });
    this.logger.log(
      executablePath
        ? `Puppeteer listo (Chromium: ${executablePath})`
        : 'Puppeteer listo para generar PDFs (bundle por defecto)',
    );
  }

  async onModuleDestroy(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  private resolveTemplatePath(templateName: string): string {
    const safeBase = basename(templateName);
    if (safeBase !== templateName || !/^[a-z0-9_-]+$/i.test(templateName)) {
      throw new BadRequestException('Nombre de plantilla no permitido');
    }
    const fullPath = join(this.templatesDir, `${templateName}.html`);
    if (!fullPath.startsWith(this.templatesDir)) {
      throw new BadRequestException('Ruta de plantilla inválida');
    }
    return fullPath;
  }

  async renderPdfFromTemplate(
    templateName: string,
    data: Record<string, unknown>,
    options: PdfRenderOptions = {},
  ): Promise<Buffer> {
    if (!this.browser) {
      throw new BadRequestException(
        'El generador PDF no está disponible; reinicie el servidor',
      );
    }

    const templatePath = this.resolveTemplatePath(templateName);
    const source = await readFile(templatePath, 'utf-8');
    const template = handlebars.compile(source);
    const html = template(data);

    const page = await this.browser.newPage();
    try {
      await page.setContent(html, { waitUntil: 'load' });
      const pdf = await page.pdf({
        format: options.format ?? 'A4',
        printBackground: true,
        displayHeaderFooter: options.displayHeaderFooter ?? false,
        headerTemplate: options.headerTemplate ?? '<span></span>',
        footerTemplate: options.footerTemplate ?? '<span></span>',
        margin: options.margin ?? {
          top: options.displayHeaderFooter ? '28mm' : '20mm',
          right: '15mm',
          bottom: options.displayHeaderFooter ? '22mm' : '20mm',
          left: '15mm',
        },
      });
      return Buffer.from(pdf);
    } finally {
      await page.close();
    }
  }
}
