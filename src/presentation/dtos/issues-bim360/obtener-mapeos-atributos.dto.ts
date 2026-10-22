import { z } from 'zod';
import { defineZodDto } from '../../validation/zod-dto';

export class ObtenerMapeosAtributosDto {
  static readonly schema: z.ZodType<ObtenerMapeosAtributosDto> =
    defineZodDto<ObtenerMapeosAtributosDto>(
      'issues-bim360_ObtenerMapeosAtributosDto',
      {
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
      },
    );

  limit?: number;

  offset?: number;
}
