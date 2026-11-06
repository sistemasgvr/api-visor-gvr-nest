import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';

export class ObtenerEstadoJobDto {
  static readonly schema: z.ZodType<ObtenerEstadoJobDto> =
    defineZodDto<ObtenerEstadoJobDto>('ObtenerEstadoJobDto', {
      filters: { schema: z.record(z.string(), z.unknown()), optional: true },
    });

  filters?: Record<string, any>;
}
