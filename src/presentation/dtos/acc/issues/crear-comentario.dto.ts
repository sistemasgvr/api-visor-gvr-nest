import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';

export class CrearComentarioDto {
  static readonly schema: z.ZodType<CrearComentarioDto> =
    defineZodDto<CrearComentarioDto>('acc_issues_CrearComentarioDto', {
      body: { schema: z.string() },
      issueId: { schema: z.string(), optional: true },
    });

  body: string;

  issueId?: string;
}
