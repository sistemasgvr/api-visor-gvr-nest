import { z } from 'zod';
import { defineZodDto } from '../../validation/zod-dto';

export class GenerarUrlAutorizacionDto {
  static readonly schema: z.ZodType<GenerarUrlAutorizacionDto> =
    defineZodDto<GenerarUrlAutorizacionDto>('GenerarUrlAutorizacionDto', {
      scopes: { schema: z.array(z.string()), optional: true },
    });

  scopes?: string[];
}
