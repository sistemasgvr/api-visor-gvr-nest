import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';

export class ObtenerReferenciasDto {
  static readonly schema: z.ZodType<ObtenerReferenciasDto> =
    defineZodDto<ObtenerReferenciasDto>('ObtenerReferenciasDto', {
      filters: { schema: z.record(z.string(), z.unknown()), optional: true },
    });

  filters?: Record<string, any>;
}
