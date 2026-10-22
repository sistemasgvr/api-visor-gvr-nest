import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';

export class ListarRecursosDto {
  static readonly schema: z.ZodType<ListarRecursosDto> =
    defineZodDto<ListarRecursosDto>('ListarRecursosDto', {
      busqueda: { schema: z.string(), optional: true, defaultValue: '' },
      resource_type: { schema: z.string(), optional: true, defaultValue: '' },
      limit: {
        schema: z.number().int().min(1).max(200),
        optional: true,
        coerce: 'number',
        defaultValue: 10,
      },
      offset: {
        schema: z.number().int().min(0),
        optional: true,
        coerce: 'number',
        defaultValue: 0,
      },
    });

  busqueda?: string = '';

  resource_type?: string = '';

  limit?: number = 10;

  offset?: number = 0;
}
