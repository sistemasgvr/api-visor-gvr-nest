import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';

export class ObtenerBusinessUnitsHijasDto {
  static readonly schema: z.ZodType<ObtenerBusinessUnitsHijasDto> =
    defineZodDto<ObtenerBusinessUnitsHijasDto>('ObtenerBusinessUnitsHijasDto', {
      parent_id: { schema: z.string(), optional: true },
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

  parent_id?: string;

  region?: string;
}
