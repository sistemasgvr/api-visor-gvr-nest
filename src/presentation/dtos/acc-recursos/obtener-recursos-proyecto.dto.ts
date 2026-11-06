import { z } from 'zod';
import { defineZodDto } from '../../validation/zod-dto';

export class ObtenerRecursosProyectoDto {
  static readonly schema: z.ZodType<ObtenerRecursosProyectoDto> =
    defineZodDto<ObtenerRecursosProyectoDto>('ObtenerRecursosProyectoDto', {
      tipo: { schema: z.string(), optional: true },
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

  tipo?: string;

  limit?: number;

  offset?: number;
}
