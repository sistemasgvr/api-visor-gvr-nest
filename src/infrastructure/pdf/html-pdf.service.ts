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
import { IHtmlPdfGenerator } from 'src/domain/services/html-pdf-generator.interface';

/** Genera PDF desde plantillas HTML; el demo sample-report se expone en GET /api/demo/pdf */
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
    this.browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
      ],
    });
    this.logger.log('Puppeteer browser listo para generar PDFs');
  }

  async onModuleDestroy(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  private resolveTemplatePath(templateName: string): string {
    const safeBase = basename(templateName);
    if (safeBase !== templateName || !/^[a-z0-9-]+$/i.test(templateName)) {
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
        format: 'A4',
        printBackground: true,
        margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' },
      });
      return Buffer.from(pdf);
    } finally {
      await page.close();
    }
  }
}
