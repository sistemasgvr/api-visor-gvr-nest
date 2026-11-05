import { z } from 'zod';
import { defineZodDto } from '../../validation/zod-dto';

export class ObtenerAdjuntosDto {
  static readonly schema: z.ZodType<ObtenerAdjuntosDto> =
    defineZodDto<ObtenerAdjuntosDto>('issues-bim360_ObtenerAdjuntosDto', {
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
    });

  limit?: number;

  offset?: number;
}
