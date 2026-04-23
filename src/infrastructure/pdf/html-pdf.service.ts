import {
  Injectable,
  Logger,
  OnModuleDestroy,
  BadRequestException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { readFile } from 'fs/promises';
import { basename, join } from 'path';
import * as handlebars from 'handlebars';
import puppeteer, { Browser } from 'puppeteer';
import type {
  IHtmlPdfGenerator,
  PdfRenderOptions,
} from 'src/domain/services/html-pdf-generator.interface';

/**
 * Genera PDFs desde plantillas HTML con Handlebars.
 * Chromium se inicia en la primera petición (lazy), para que Nest arranque en Windows
 * aunque falle spawn (p. ej. sin Chrome o sin PUPPETEER_EXECUTABLE_PATH).
 */
@Injectable()
export class HtmlPdfService implements IHtmlPdfGenerator, OnModuleDestroy {
  private readonly logger = new Logger(HtmlPdfService.name);
  private browser: Browser | null = null;
  private launchPromise: Promise<Browser> | null = null;

  private get templatesDir(): string {
    return join(__dirname, 'templates');
  }

  private async ensureBrowser(): Promise<Browser> {
    if (this.browser) {
      return this.browser;
    }
    if (this.launchPromise) {
      return this.launchPromise;
    }
    const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH?.trim();
    this.launchPromise = puppeteer
      .launch({
        headless: true,
        ...(executablePath ? { executablePath } : {}),
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
        ],
      })
      .then((b) => {
        this.browser = b;
        this.logger.log(
          executablePath
            ? `Puppeteer listo (Chromium: ${executablePath})`
            : 'Puppeteer listo para generar PDFs (bundle por defecto)',
        );
        return b;
      })
      .catch((err: unknown) => {
        this.launchPromise = null;
        const msg = err instanceof Error ? err.message : String(err);
        this.logger.error(
          `No se pudo iniciar Chromium/Puppeteer (${msg}). En Windows suele ayudar definir ` +
            `PUPPETEER_EXECUTABLE_PATH con la ruta a Chrome, p. ej. ` +
            `C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe`,
        );
        throw new ServiceUnavailableException(
          'El generador PDF no está disponible. Defina la variable de entorno PUPPETEER_EXECUTABLE_PATH ' +
            'apuntando a Google Chrome o Microsoft Edge (Chromium) e inténtelo de nuevo.',
        );
      });
    return this.launchPromise;
  }

  async onModuleDestroy(): Promise<void> {
    try {
      if (this.launchPromise) {
        const b = await this.launchPromise;
        await b.close();
      } else if (this.browser) {
        await this.browser.close();
      }
    } catch {
      // Launch fallido o cierre durante shutdown
    } finally {
      this.browser = null;
      this.launchPromise = null;
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
    const browser = await this.ensureBrowser();

    const templatePath = this.resolveTemplatePath(templateName);
    const source = await readFile(templatePath, 'utf-8');
    const template = handlebars.compile(source);
    const html = template(data);

    const page = await browser.newPage();
    try {
      await page.setContent(html, { waitUntil: 'load' });
      const pdf = await page.pdf({
        format: options.format ?? 'A4',
        landscape: options.landscape ?? false,
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
