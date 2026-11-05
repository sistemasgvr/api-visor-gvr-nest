import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';

export class GetProyectosPorTipoDto {
  static readonly schema: z.ZodType<GetProyectosPorTipoDto> =
    defineZodDto<GetProyectosPorTipoDto>('GetProyectosPorTipoDto', {
      tipos: {
        schema: z
          .array(z.string())
          .min(1)
          .refine(
            (value) =>
              value !== undefined &&
              value !== null &&
              (value as unknown) !== '',
            { message: 'El campo es obligatorio' },
          ),
      },
      fields: { schema: z.string(), optional: true },
      filter_status: { schema: z.string(), optional: true },
      sort: { schema: z.string(), optional: true },
      limit: {
        schema: z.number().int().min(1).max(200),
        optional: true,
        coerce: 'number',
        defaultValue: 20,
      },
      offset: {
        schema: z.number().int().min(0),
        optional: true,
        coerce: 'number',
        defaultValue: 0,
      },
      token: { schema: z.string(), optional: true },
    });

  tipos: string[];

  fields?: string;

  filter_status?: string;

  sort?: string;

  limit?: number = 20;

  offset?: number = 0;

  token?: string;
}
