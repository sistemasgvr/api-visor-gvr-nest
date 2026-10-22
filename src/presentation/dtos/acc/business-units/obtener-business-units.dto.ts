import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';

export class ObtenerBusinessUnitsDto {
  static readonly schema: z.ZodType<ObtenerBusinessUnitsDto> =
    defineZodDto<ObtenerBusinessUnitsDto>('ObtenerBusinessUnitsDto', {
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

  region?: string;
}
