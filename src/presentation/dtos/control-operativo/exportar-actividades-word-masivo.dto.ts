import { z } from 'zod';
import { defineZodDto, isoDate } from '../../validation/zod-dto';

export class ExportarActividadesWordMasivoDto {
  static readonly schema: z.ZodType<ExportarActividadesWordMasivoDto> =
    defineZodDto<ExportarActividadesWordMasivoDto>(
      'ExportarActividadesWordMasivoDto',
      {
        fechaInicio: {
          schema: z
            .string()
            .refine((value) => isoDate(value, false), {
              message: 'Debe ser una fecha ISO válida',
            })
            .meta({ format: 'date-time' }),
        },
        fechaFin: {
          schema: z
            .string()
            .refine((value) => isoDate(value, false), {
              message: 'Debe ser una fecha ISO válida',
            })
            .meta({ format: 'date-time' }),
        },
        fechaEmision: {
          schema: z
            .string()
            .refine((value) => isoDate(value, false), {
              message: 'Debe ser una fecha ISO válida',
            })
            .meta({ format: 'date-time' }),
          optional: true,
        },
        idsTrabajador: { schema: z.array(z.number().int().min(1)).min(1) },
      },
    );

  fechaInicio: string;

  fechaFin: string;

  fechaEmision?: string;

  idsTrabajador: number[];
}
