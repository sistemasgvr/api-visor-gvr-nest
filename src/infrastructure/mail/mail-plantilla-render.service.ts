import { Injectable, BadRequestException } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as handlebars from 'handlebars';
import type { RenderedMail } from '../../domain/services/mail-renderer.interface';
import { MailTemplateRenderException } from '../../shared/exceptions/mail.exceptions';
import { MjmlCompilerService } from './mjml-compiler.service';

export interface MailPlantillaRenderInput {
  asuntoPlantilla: string;
  cuerpoMjml?: string | null;
  cuerpoHtml?: string | null;
  claveLayout?: string;
  variables?: Record<string, unknown>;
}

@Injectable()
export class MailPlantillaRenderService {
  private readonly templatesRoot = path.join(__dirname, 'templates');
  private readonly layoutCache = new Map<string, handlebars.TemplateDelegate>();

  constructor(private readonly mjmlCompiler: MjmlCompilerService) {}

  async render(input: MailPlantillaRenderInput): Promise<RenderedMail> {
    const variables = input.variables ?? {};
    const claveLayout = (input.claveLayout ?? 'base').trim() || 'base';
    const asuntoPlantilla = (input.asuntoPlantilla ?? '').trim();

    if (!asuntoPlantilla) {
      throw new BadRequestException('El asunto de la plantilla es obligatorio');
    }

    const bodyHtml = await this.resolveBodyHtml(input.cuerpoMjml, input.cuerpoHtml);
    const layoutTpl = await this.getLayoutTemplate(claveLayout);

    let innerHtml: string;
    let html: string;
    let subject: string;

    try {
      const bodyTpl = handlebars.compile(bodyHtml);
      innerHtml = bodyTpl(variables);
      html = layoutTpl({ ...variables, content: innerHtml });
      subject = handlebars.compile(asuntoPlantilla)(variables).trim();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      throw new MailTemplateRenderException(
        `Error al renderizar la plantilla: ${msg}`,
      );
    }

    if (!subject) {
      subject = '[Correo]';
    }

    return { subject, html };
  }

  private async resolveBodyHtml(
    cuerpoMjml?: string | null,
    cuerpoHtml?: string | null,
  ): Promise<string> {
    const mjml = cuerpoMjml?.trim();
    if (mjml) {
      if (this.mjmlCompiler.looksLikeHtml(mjml) && !this.mjmlCompiler.looksLikeMjml(mjml)) {
        return mjml;
      }
      return (await this.mjmlCompiler.compile(mjml)).html;
    }
    const html = cuerpoHtml?.trim();
    if (html) {
      return html;
    }
    throw new BadRequestException(
      'Debe proporcionar cuerpoMjml o cuerpoHtml para renderizar',
    );
  }

  private async getLayoutTemplate(
    claveLayout: string,
  ): Promise<handlebars.TemplateDelegate> {
    const layoutKey = `layouts/${claveLayout}.hbs`;
    if (this.layoutCache.has(layoutKey)) {
      return this.layoutCache.get(layoutKey)!;
    }

    const layoutPath = path.join(
      this.templatesRoot,
      'layouts',
      `${claveLayout}.hbs`,
    );

    let layoutSource: string;
    try {
      layoutSource = await fs.readFile(layoutPath, 'utf-8');
    } catch (e) {
      const err = e as NodeJS.ErrnoException;
      if (err?.code === 'ENOENT') {
        if (claveLayout !== 'base') {
          return this.getLayoutTemplate('base');
        }
        throw new MailTemplateRenderException(
          `Layout de correo no encontrado: ${claveLayout}`,
        );
      }
      throw new MailTemplateRenderException(
        `No se pudo leer el layout "${claveLayout}": ${err instanceof Error ? err.message : String(e)}`,
      );
    }

    const tpl = handlebars.compile(layoutSource);
    this.layoutCache.set(layoutKey, tpl);
    return tpl;
  }
}
