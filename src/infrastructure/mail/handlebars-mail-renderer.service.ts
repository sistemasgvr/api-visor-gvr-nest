import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as handlebars from 'handlebars';
import type {
  IMailRenderer,
  RenderedMail,
} from '../../domain/services/mail-renderer.interface';
import { MAIL_TEMPLATE_REGISTRY } from './template-registry';
import { MailTemplateRenderException } from '../../shared/exceptions/mail.exceptions';

@Injectable()
export class HandlebarsMailRendererService implements IMailRenderer {
  private readonly logger = new Logger(HandlebarsMailRendererService.name);
  private readonly templatesRoot = path.join(__dirname, 'templates');
  private readonly layoutCache = new Map<string, handlebars.TemplateDelegate>();
  private readonly partialCache = new Map<
    string,
    handlebars.TemplateDelegate
  >();

  async render(
    templateId: string,
    variables: Record<string, unknown>,
    subjectOverride?: string,
  ): Promise<RenderedMail> {
    const def = MAIL_TEMPLATE_REGISTRY[templateId];
    if (!def) {
      throw new HttpException(
        {
          message: `Plantilla de correo no registrada: "${templateId}". Añádala en template-registry y en templates/.`,
          code: 'MAIL_TEMPLATE_UNKNOWN',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const layoutPath = path.join(this.templatesRoot, 'layouts', 'base.hbs');
    const bodyPath = path.join(this.templatesRoot, def.file);

    let layoutSource: string;
    let bodySource: string;
    try {
      [layoutSource, bodySource] = await Promise.all([
        fs.readFile(layoutPath, 'utf-8'),
        fs.readFile(bodyPath, 'utf-8'),
      ]);
    } catch (e) {
      const err = e as NodeJS.ErrnoException;
      if (err?.code === 'ENOENT') {
        throw new MailTemplateRenderException(
          `Archivo .hbs no encontrado (layout o cuerpo) para la plantilla "${templateId}".`,
        );
      }
      throw new MailTemplateRenderException(
        `No se pudieron leer las plantillas: ${err instanceof Error ? err.message : String(e)}`,
      );
    }

    try {
      const layoutKey = 'layouts/base.hbs';
      const bodyKey = def.file;
      if (!this.layoutCache.has(layoutKey)) {
        this.layoutCache.set(layoutKey, handlebars.compile(layoutSource));
      }
      if (!this.partialCache.has(bodyKey)) {
        this.partialCache.set(bodyKey, handlebars.compile(bodySource));
      }

      const layoutTpl = this.layoutCache.get(layoutKey)!;
      const bodyTpl = this.partialCache.get(bodyKey)!;

      const innerHtml = bodyTpl(variables);
      const html = layoutTpl({ ...variables, content: innerHtml });

      const subjectTpl = handlebars.compile(
        subjectOverride ?? def.defaultSubject,
      );
      const subject = subjectTpl(variables).trim();
      if (!subject) {
        this.logger.warn(
          `Asunto vacío para template=${templateId}, usando id como fallback`,
        );
      }

      return {
        subject: subject || `[${templateId}]`,
        html,
      };
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      }
      const msg = e instanceof Error ? e.message : String(e);
      this.logger.error(`Error renderizando template=${templateId}: ${msg}`);
      throw new MailTemplateRenderException(
        `Error al renderizar la plantilla "${templateId}": ${msg}`,
      );
    }
  }
}
