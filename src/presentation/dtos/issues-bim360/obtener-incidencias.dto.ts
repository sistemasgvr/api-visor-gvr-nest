import { z } from 'zod';
import { defineZodDto } from '../../validation/zod-dto';

export class ObtenerIncidenciasDto {
  static readonly schema: z.ZodType<ObtenerIncidenciasDto> =
    defineZodDto<ObtenerIncidenciasDto>('issues-bim360_ObtenerIncidenciasDto', {
      limit: {
        schema: z.number().int().min(1).max(200),
        optional: true,
        coerce: 'number',
      },
      offset: {
        schema: z.number().int().min(0),
        optional: true,
        coerce: 'number',
      },
      filter: { schema: z.record(z.string(), z.unknown()), optional: true },
    });

  limit?: number;

  offset?: number;

  filter?: Record<string, any>;
}
