import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';

export class ObtenerRelacionesLinksDto {
  static readonly schema: z.ZodType<ObtenerRelacionesLinksDto> =
    defineZodDto<ObtenerRelacionesLinksDto>('ObtenerRelacionesLinksDto', {
      filters: { schema: z.record(z.string(), z.unknown()), optional: true },
    });

  filters?: Record<string, any>;
}
