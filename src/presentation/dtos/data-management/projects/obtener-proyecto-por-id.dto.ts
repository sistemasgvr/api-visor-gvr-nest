import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';

export class ObtenerProyectoPorIdDto {
  static readonly schema: z.ZodType<ObtenerProyectoPorIdDto> =
    defineZodDto<ObtenerProyectoPorIdDto>('ObtenerProyectoPorIdDto', {
      filters: { schema: z.record(z.string(), z.unknown()), optional: true },
    });

  filters?: Record<string, any>;
}
