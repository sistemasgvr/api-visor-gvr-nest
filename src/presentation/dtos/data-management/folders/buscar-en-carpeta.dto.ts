import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';

export class BuscarEnCarpetaDto {
  static readonly schema: z.ZodType<BuscarEnCarpetaDto> =
    defineZodDto<BuscarEnCarpetaDto>('BuscarEnCarpetaDto', {
      filters: { schema: z.record(z.string(), z.unknown()), optional: true },
    });

  filters?: Record<string, any>;
}
