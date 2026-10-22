import { z } from 'zod';
import { defineZodDto } from '../../validation/zod-dto';

export class ObtenerIncidenciasPorDocumentoDto {
  static readonly schema: z.ZodType<ObtenerIncidenciasPorDocumentoDto> =
    defineZodDto<ObtenerIncidenciasPorDocumentoDto>(
      'issues-bim360_ObtenerIncidenciasPorDocumentoDto',
      {
        documentUrn: { schema: z.string() },
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

  documentUrn: string;

  limit?: number;

  offset?: number;
}
