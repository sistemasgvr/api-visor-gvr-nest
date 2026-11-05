import { z } from 'zod';
import { defineZodDto } from '../../validation/zod-dto';

export class ObtenerHistorialUsuarioDto {
  static readonly schema: z.ZodType<ObtenerHistorialUsuarioDto> =
    defineZodDto<ObtenerHistorialUsuarioDto>('ObtenerHistorialUsuarioDto', {
      limit: {
        schema: z.number().int().min(1).max(100),
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
