import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';

export class BuscarUsuariosDto {
  static readonly schema: z.ZodType<BuscarUsuariosDto> =
    defineZodDto<BuscarUsuariosDto>('BuscarUsuariosDto', {
      name: { schema: z.string().min(1) },
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
      operator: {
        schema: z
          .string()
          .refine(
            (value) => (['and', 'or'] as readonly unknown[]).includes(value),
            { message: 'Seleccione una opción válida' },
          )
          .meta({ enum: ['and', 'or'] }),
        optional: true,
      },
      partial: { schema: z.boolean(), optional: true, coerce: 'boolean' },
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

  name: string;

  limit?: number;

  offset?: number;

  operator?: string;

  partial?: boolean;

  region?: string;
}
