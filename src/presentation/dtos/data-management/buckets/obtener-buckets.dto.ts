import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';

export class ObtenerBucketsDto {
  static readonly schema: z.ZodType<ObtenerBucketsDto> =
    defineZodDto<ObtenerBucketsDto>('ObtenerBucketsDto', {
      region: {
        schema: z
          .string()
          .refine(
            (value) =>
              (['US', 'EMEA', 'AP'] as readonly unknown[]).includes(value),
            { message: 'Seleccione una opción válida' },
          )
          .meta({ enum: ['US', 'EMEA', 'AP'] }),
        optional: true,
      },
      limit: {
        schema: z.number().int().min(1).max(100),
        optional: true,
        coerce: 'number',
      },
      startAt: { schema: z.string(), optional: true },
    });

  region?: string;

  limit?: number;

  startAt?: string;
}
