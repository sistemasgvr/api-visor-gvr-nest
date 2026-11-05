import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';

export class ObtenerCarpetaPorIdDto {
  static readonly schema: z.ZodType<ObtenerCarpetaPorIdDto> =
    defineZodDto<ObtenerCarpetaPorIdDto>('ObtenerCarpetaPorIdDto', {
      filters: { schema: z.record(z.string(), z.unknown()), optional: true },
    });

  filters?: Record<string, any>;
}
