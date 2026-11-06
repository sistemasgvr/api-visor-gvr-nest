import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';

export class ObtenerCarpetaPadreDto {
  static readonly schema: z.ZodType<ObtenerCarpetaPadreDto> =
    defineZodDto<ObtenerCarpetaPadreDto>('ObtenerCarpetaPadreDto', {
      filters: { schema: z.record(z.string(), z.unknown()), optional: true },
    });

  filters?: Record<string, any>;
}
