import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';

export class CrearCompanyDto {
  static readonly schema: z.ZodType<CrearCompanyDto> =
    defineZodDto<CrearCompanyDto>('CrearCompanyDto', {
      name: { schema: z.string().min(1).max(255) },
      trade: { schema: z.string().min(1) },
      address_line_1: { schema: z.string().max(255), optional: true },
      address_line_2: { schema: z.string().max(255), optional: true },
      city: { schema: z.string().max(255), optional: true },
      state_or_province: { schema: z.string().max(255), optional: true },
      postal_code: { schema: z.string().max(255), optional: true },
      country: { schema: z.string(), optional: true },
      phone: { schema: z.string().max(255), optional: true },
      website_url: { schema: z.string().max(255), optional: true },
      description: { schema: z.string().max(255), optional: true },
      erp_id: { schema: z.string(), optional: true },
      tax_id: { schema: z.string(), optional: true },
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

  trade: string;

  address_line_1?: string;

  address_line_2?: string;

  city?: string;

  state_or_province?: string;

  postal_code?: string;

  country?: string;

  phone?: string;

  website_url?: string;

  description?: string;

  erp_id?: string;

  tax_id?: string;

  region?: string;
}
