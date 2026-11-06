import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';

export class ObtenerProyectosLegacyDto {
  static readonly schema: z.ZodType<ObtenerProyectosLegacyDto> =
    defineZodDto<ObtenerProyectosLegacyDto>('ObtenerProyectosLegacyDto', {
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

  // Cualquier otro filtro opcional se pasa como query params
  [key: string]: any;
}
