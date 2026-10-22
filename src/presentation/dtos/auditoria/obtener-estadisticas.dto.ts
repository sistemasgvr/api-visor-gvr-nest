import { z } from 'zod';
import { defineZodDto, isoDate } from '../../validation/zod-dto';

export class ObtenerEstadisticasDto {
  static readonly schema: z.ZodType<ObtenerEstadisticasDto> =
    defineZodDto<ObtenerEstadisticasDto>('ObtenerEstadisticasDto', {
      fecha_desde: {
        schema: z
          .string()
          .refine((value) => isoDate(value, false), {
            message: 'Debe ser una fecha ISO válida',
          })
          .meta({ format: 'date-time' }),
        optional: true,
      },
      fecha_hasta: {
        schema: z
          .string()
          .refine((value) => isoDate(value, false), {
            message: 'Debe ser una fecha ISO válida',
          })
          .meta({ format: 'date-time' }),
        optional: true,
      },
    });

  fecha_desde?: string;

  fecha_hasta?: string;
}
