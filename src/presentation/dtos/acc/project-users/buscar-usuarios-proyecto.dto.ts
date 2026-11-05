import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';

export class BuscarUsuariosProyectoDto {
  static readonly schema: z.ZodType<BuscarUsuariosProyectoDto> =
    defineZodDto<BuscarUsuariosProyectoDto>('BuscarUsuariosProyectoDto', {
      name: { schema: z.string(), optional: true },
      email: { schema: z.string(), optional: true },
      companyName: { schema: z.string(), optional: true },
      filterTextMatch: {
        schema: z
          .string()
          .refine(
            (value) =>
              (
                [
                  'contains',
                  'startsWith',
                  'endsWith',
                  'equals',
                ] as readonly unknown[]
              ).includes(value),
            { message: 'Seleccione una opción válida' },
          )
          .meta({ enum: ['contains', 'startsWith', 'endsWith', 'equals'] }),
        optional: true,
      },
      limit: {
        schema: z.number().int().min(1).max(200),
        optional: true,
        coerce: 'number',
      },
      offset: {
        schema: z.number().int().min(0),
        optional: true,
        coerce: 'number',
      },
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
      user_id: { schema: z.string(), optional: true },
    });

  name?: string;

  email?: string;

  companyName?: string;

  filterTextMatch?: string;

  limit?: number;

  offset?: number;

  region?: string;

  user_id?: string;
}
