import { z } from 'zod';
import { defineZodDto, isoDate } from '../../validation/zod-dto';

export class ListarAuditoriasDto {
  static readonly schema: z.ZodType<ListarAuditoriasDto> =
    defineZodDto<ListarAuditoriasDto>('ListarAuditoriasDto', {
      idusuario: { schema: z.number().int(), optional: true, coerce: 'number' },
      accion: { schema: z.string(), optional: true },
      entidad: { schema: z.string(), optional: true },
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

  idusuario?: number;

  accion?: string;

  entidad?: string;

  fecha_desde?: string;

  fecha_hasta?: string;

  limit?: number;

  offset?: number;
}
