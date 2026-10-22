import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';

export class BuscarBusinessUnitsDto {
  static readonly schema: z.ZodType<BuscarBusinessUnitsDto> =
    defineZodDto<BuscarBusinessUnitsDto>('BuscarBusinessUnitsDto', {
      term: { schema: z.string().min(1) },
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

  term: string;

  region?: string;
}
