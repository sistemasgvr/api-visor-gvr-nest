import { z } from 'zod';
import { defineZodDto } from '../../validation/zod-dto';

export class ObtenerProyectosDto {
  static readonly schema: z.ZodType<ObtenerProyectosDto> =
    defineZodDto<ObtenerProyectosDto>('data-management_ObtenerProyectosDto', {
      filters: { schema: z.record(z.string(), z.unknown()), optional: true },
    });

  filters?: Record<string, any>;
}
