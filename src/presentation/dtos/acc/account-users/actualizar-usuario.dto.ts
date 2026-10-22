import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';

export class ActualizarUsuarioDto {
  static readonly schema: z.ZodType<ActualizarUsuarioDto> =
    defineZodDto<ActualizarUsuarioDto>('ActualizarUsuarioDto', {
      company_id: { schema: z.string(), optional: true },
      nickname: { schema: z.string().max(255), optional: true },
      first_name: { schema: z.string().max(255), optional: true },
      last_name: { schema: z.string().max(255), optional: true },
      image_url: { schema: z.string().max(255), optional: true },
      address_line_1: { schema: z.string().max(255), optional: true },
      address_line_2: { schema: z.string().max(255), optional: true },
      city: { schema: z.string().max(255), optional: true },
      state_or_province: { schema: z.string().max(255), optional: true },
      postal_code: { schema: z.string().max(255), optional: true },
      country: { schema: z.string(), optional: true },
      phone: { schema: z.string().max(255), optional: true },
      company: { schema: z.string().max(255), optional: true },
      job_title: { schema: z.string().max(255), optional: true },
      industry: { schema: z.string().max(255), optional: true },
      about_me: { schema: z.string().max(255), optional: true },
      default_role: { schema: z.string().max(255), optional: true },
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

  company_id?: string;

  nickname?: string;

  first_name?: string;

  last_name?: string;

  image_url?: string;

  address_line_1?: string;

  address_line_2?: string;

  city?: string;

  state_or_province?: string;

  postal_code?: string;

  country?: string;

  phone?: string;

  company?: string;

  job_title?: string;

  industry?: string;

  about_me?: string;

  default_role?: string;

  region?: string;
}
