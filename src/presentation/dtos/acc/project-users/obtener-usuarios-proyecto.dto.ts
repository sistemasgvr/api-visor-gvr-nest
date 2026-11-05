import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';

export class ObtenerUsuariosProyectoDto {
  static readonly schema: z.ZodType<ObtenerUsuariosProyectoDto> =
    defineZodDto<ObtenerUsuariosProyectoDto>('ObtenerUsuariosProyectoDto', {
      filter: { schema: z.array(z.unknown()), optional: true },
      sort: { schema: z.array(z.unknown()), optional: true },
      fields: { schema: z.array(z.unknown()), optional: true },
      orFilters: { schema: z.array(z.unknown()), optional: true },
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

  filter?: Record<string, any>;

  sort?: string[];

  fields?: string[];

  orFilters?: string[];

  filterTextMatch?: string;

  limit?: number;

  offset?: number;

  region?: string;

  user_id?: string;
}
