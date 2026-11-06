import { z } from 'zod';
import { defineZodDto } from '../../validation/zod-dto';

export class ObtenerTiposIncidenciasDto {
  static readonly schema: z.ZodType<ObtenerTiposIncidenciasDto> =
    defineZodDto<ObtenerTiposIncidenciasDto>(
      'issues-bim360_ObtenerTiposIncidenciasDto',
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
