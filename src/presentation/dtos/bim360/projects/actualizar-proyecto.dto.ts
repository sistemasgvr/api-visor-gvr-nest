import { z } from 'zod';
import { defineZodDto, isoDate } from '../../../validation/zod-dto';

export class ActualizarProyectoBim360Dto {
  static readonly schema: z.ZodType<ActualizarProyectoBim360Dto> =
    defineZodDto<ActualizarProyectoBim360Dto>('ActualizarProyectoBim360Dto', {
      name: { schema: z.string().max(255), optional: true },
      status: { schema: z.string(), optional: true },
      start_date: {
        schema: z
          .string()
          .refine((value) => isoDate(value, false), {
            message: 'Debe ser una fecha ISO válida',
          })
          .meta({ format: 'date-time' }),
        optional: true,
      },
      end_date: {
        schema: z
          .string()
          .refine((value) => isoDate(value, false), {
            message: 'Debe ser una fecha ISO válida',
          })
          .meta({ format: 'date-time' }),
        optional: true,
      },
      project_type: { schema: z.string(), optional: true },
      value: { schema: z.number(), optional: true },
      currency: { schema: z.string().max(3), optional: true },
      job_number: { schema: z.string().max(255), optional: true },
      address_line_1: { schema: z.string().max(255), optional: true },
      city: { schema: z.string().max(255), optional: true },
      state_or_province: { schema: z.string().max(255), optional: true },
      postal_code: { schema: z.string().max(255), optional: true },
      country: { schema: z.string(), optional: true },
      timezone: { schema: z.string(), optional: true },
      language: { schema: z.string(), optional: true },
      construction_type: { schema: z.string(), optional: true },
      contract_type: { schema: z.string(), optional: true },
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

  name?: string;

  status?: string;

  start_date?: string;

  end_date?: string;

  project_type?: string;

  value?: number;

  currency?: string;

  job_number?: string;

  address_line_1?: string;

  city?: string;

  state_or_province?: string;

  postal_code?: string;

  country?: string;

  timezone?: string;

  language?: string;

  construction_type?: string;

  contract_type?: string;

  region?: string;
}
