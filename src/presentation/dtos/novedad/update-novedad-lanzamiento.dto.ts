import { z } from 'zod';
import { defineZodDto, isoDate } from '../../validation/zod-dto';

export class UpdateNovedadLanzamientoDto {
  static readonly schema: z.ZodType<UpdateNovedadLanzamientoDto> =
    defineZodDto<UpdateNovedadLanzamientoDto>('UpdateNovedadLanzamientoDto', {
      titulo: { schema: z.string().min(1).max(255) },
      fechaPublicacion: {
        schema: z
          .string()
          .refine((value) => isoDate(value, false), {
            message: 'Debe ser una fecha ISO válida',
          })
          .meta({ format: 'date-time' }),
        optional: true,
      },
      fechaVigenciaHasta: {
        schema: z
          .string()
          .refine((value) => isoDate(value, false), {
            message: 'Debe ser una fecha ISO válida',
          })
          .meta({ format: 'date-time' }),
        optional: true,
      },
      textoBotonCerrar: { schema: z.string().max(80), optional: true },
    });

  titulo: string;

  fechaPublicacion?: string;

  fechaVigenciaHasta?: string;

  textoBotonCerrar?: string;
}
