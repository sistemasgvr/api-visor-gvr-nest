import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';

export class ObtenerUsuariosDto {
  static readonly schema: z.ZodType<ObtenerUsuariosDto> =
    defineZodDto<ObtenerUsuariosDto>('ObtenerUsuariosDto', {
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
      sort: {
        schema: z
          .string()
          .refine(
            (value) =>
              (
                [
                  'name',
                  'email',
                  'created_at',
                  'updated_at',
                ] as readonly unknown[]
              ).includes(value),
            { message: 'Seleccione una opción válida' },
          )
          .meta({ enum: ['name', 'email', 'created_at', 'updated_at'] }),
        optional: true,
      },
      field: {
        schema: z
          .string()
          .refine(
            (value) =>
              (
                [
                  'name',
                  'email',
                  'company_name',
                  'role',
                  'status',
                ] as readonly unknown[]
              ).includes(value),
            { message: 'Seleccione una opción válida' },
          )
          .meta({ enum: ['name', 'email', 'company_name', 'role', 'status'] }),
        optional: true,
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
    });

  limit?: number;

  offset?: number;

  sort?: string;

  field?: string;

  region?: string;
}
