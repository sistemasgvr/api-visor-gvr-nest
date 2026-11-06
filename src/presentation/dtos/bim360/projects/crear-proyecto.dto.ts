import { z } from 'zod';
import { defineZodDto, isoDate } from '../../../validation/zod-dto';

export class CrearProyectoBim360Dto {
  static readonly schema: z.ZodType<CrearProyectoBim360Dto> =
    defineZodDto<CrearProyectoBim360Dto>('CrearProyectoBim360Dto', {
      name: { schema: z.string().min(1).max(255) },
      start_date: {
        schema: z
          .string()
          .min(1)
          .refine((value) => isoDate(value, false), {
            message: 'Debe ser una fecha ISO válida',
          })
          .meta({ format: 'date-time' }),
      },
      end_date: {
        schema: z
          .string()
          .min(1)
          .refine((value) => isoDate(value, false), {
            message: 'Debe ser una fecha ISO válida',
          })
          .meta({ format: 'date-time' }),
      },
      project_type: { schema: z.string().min(1) },
      value: {
        schema: z
          .number()
          .refine(
            (value) =>
              value !== undefined &&
              value !== null &&
              (value as unknown) !== '',
            { message: 'El campo es obligatorio' },
          ),
      },
      currency: { schema: z.string().min(1).max(3) },
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
      template_project_id: { schema: z.string(), optional: true },
      include_locations: { schema: z.boolean(), optional: true },
      include_companies: { schema: z.boolean(), optional: true },
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

  start_date: string;

  end_date: string;

  project_type: string;

  value: number;

  currency: string;

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

  template_project_id?: string;

  include_locations?: boolean;

  include_companies?: boolean;

  region?: string;
}
