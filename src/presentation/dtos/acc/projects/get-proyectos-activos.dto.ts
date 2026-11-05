import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';

export class GetProyectosActivosDto {
  static readonly schema: z.ZodType<GetProyectosActivosDto> =
    defineZodDto<GetProyectosActivosDto>('GetProyectosActivosDto', {
      fields: { schema: z.string(), optional: true },
      filter_type: { schema: z.string(), optional: true },
      filter_name: { schema: z.string(), optional: true },
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

  fields?: string;

  filter_type?: string;

  filter_name?: string;

  sort?: string;

  limit?: number = 20;

  offset?: number = 0;

  token?: string;
}
