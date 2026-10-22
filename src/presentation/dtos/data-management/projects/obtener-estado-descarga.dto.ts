import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';

export class ObtenerEstadoDescargaDto {
  static readonly schema: z.ZodType<ObtenerEstadoDescargaDto> =
    defineZodDto<ObtenerEstadoDescargaDto>('ObtenerEstadoDescargaDto', {
      filters: { schema: z.record(z.string(), z.unknown()), optional: true },
    });

  filters?: Record<string, any>;
}
