import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';

export class ObtenerRelacionesRefsDto {
  static readonly schema: z.ZodType<ObtenerRelacionesRefsDto> =
    defineZodDto<ObtenerRelacionesRefsDto>('ObtenerRelacionesRefsDto', {
      filters: { schema: z.record(z.string(), z.unknown()), optional: true },
    });

  filters?: Record<string, any>;
}
