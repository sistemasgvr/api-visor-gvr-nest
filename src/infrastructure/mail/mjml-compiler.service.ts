import { Injectable, BadRequestException } from '@nestjs/common';
import mjml2html from 'mjml';

export interface MjmlCompileResult {
  html: string;
  errors: string[];
}

@Injectable()
export class MjmlCompilerService {
  async compile(mjmlSource: string): Promise<MjmlCompileResult> {
    const trimmed = (mjmlSource ?? '').trim();
    if (!trimmed) {
      throw new BadRequestException('El cuerpo MJML está vacío');
    }

    const normalized = this.normalizeMjmlSource(trimmed);

    const result = await mjml2html(normalized, {
      validationLevel: 'soft',
      minify: false,
    });

    const errors = (result.errors ?? [])
      .map((e) => e.formattedMessage ?? e.message ?? String(e))
      .filter(Boolean);

    const html = (result.html ?? '').trim();
    if (!html) {
      throw new BadRequestException(
        errors.length > 0
          ? `Error al compilar MJML: ${errors.join('; ')}`
          : 'No se pudo generar HTML desde MJML',
      );
    }

    return { html, errors };
  }

  async compileOptional(mjmlSource?: string | null): Promise<string | null> {
    if (!mjmlSource?.trim()) {
      return null;
    }
    return (await this.compile(mjmlSource)).html;
  }

  looksLikeMjml(source: string): boolean {
    const trimmed = source.trim();
    return /<mjml[\s>]/i.test(trimmed) || /<mj-/i.test(trimmed);
  }

  looksLikeHtml(source: string): boolean {
    const trimmed = source.trim();
    return (
      /^<!doctype html/i.test(trimmed) ||
      /^<html[\s>]/i.test(trimmed) ||
      /^<table[\s>]/i.test(trimmed) ||
      /^<div[\s>]/i.test(trimmed)
    );
  }

  private normalizeMjmlSource(source: string): string {
    if (/<mjml[\s>]/i.test(source)) {
      return source;
    }
    if (/<mj-/i.test(source)) {
      return `<mjml><mj-body>${source}</mj-body></mjml>`;
    }
    return source;
  }
}
