import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';

export class ObtenerHubDeProyectoDto {
  static readonly schema: z.ZodType<ObtenerHubDeProyectoDto> =
    defineZodDto<ObtenerHubDeProyectoDto>('ObtenerHubDeProyectoDto', {
      filters: { schema: z.record(z.string(), z.unknown()), optional: true },
    });

  filters?: Record<string, any>;
}
