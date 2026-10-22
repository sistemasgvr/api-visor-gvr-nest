import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';

export class ObtenerCompaniesProyectoDto {
  static readonly schema: z.ZodType<ObtenerCompaniesProyectoDto> =
    defineZodDto<ObtenerCompaniesProyectoDto>('ObtenerCompaniesProyectoDto', {
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
      region: {
        schema: z
          .string()
          .refine(
            (value) => (['US', 'EMEA'] as readonly unknown[]).includes(value),
            { message: 'Seleccione una opción válida' },
          )
          .meta({ enum: ['US', 'EMEA'] }),
        optional: true,
      },
    });

  limit?: number;

  offset?: number;

  region?: string;
}
