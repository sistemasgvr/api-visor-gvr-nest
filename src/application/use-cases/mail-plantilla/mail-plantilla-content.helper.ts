import { BadRequestException } from '@nestjs/common';
import type { MjmlCompilerService } from '../../../infrastructure/mail/mjml-compiler.service';

export interface MailPlantillaContentInput {
  cuerpoMjml?: string | null;
  cuerpoHtml?: string | null;
}

export interface MailPlantillaContentPrepared {
  cuerpoMjml: string | null;
  cuerpoHtml: string | null;
}

export async function prepareMailPlantillaContent(
  input: MailPlantillaContentInput,
  mjmlCompiler: MjmlCompilerService,
): Promise<MailPlantillaContentPrepared> {
  const cuerpoMjml = input.cuerpoMjml?.trim() || null;
  let cuerpoHtml = input.cuerpoHtml?.trim() || null;

  if (cuerpoMjml) {
    cuerpoHtml = (await mjmlCompiler.compile(cuerpoMjml)).html;
  }

  if (!cuerpoMjml && !cuerpoHtml) {
    throw new BadRequestException(
      'Debe proporcionar cuerpoMjml o cuerpoHtml para la plantilla',
    );
  }

  return { cuerpoMjml, cuerpoHtml };
}

export async function prepareMailPlantillaContentOptional(
  input: MailPlantillaContentInput,
  mjmlCompiler: MjmlCompilerService,
): Promise<MailPlantillaContentPrepared> {
  const cuerpoMjml =
    input.cuerpoMjml !== undefined
      ? input.cuerpoMjml?.trim() || null
      : undefined;
  let cuerpoHtml =
    input.cuerpoHtml !== undefined
      ? input.cuerpoHtml?.trim() || null
      : undefined;

  if (cuerpoMjml) {
    cuerpoHtml = (await mjmlCompiler.compile(cuerpoMjml)).html;
  }

  return {
    cuerpoMjml: cuerpoMjml === undefined ? null : cuerpoMjml,
    cuerpoHtml: cuerpoHtml === undefined ? null : cuerpoHtml,
  };
}
