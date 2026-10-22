import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';

export class ListarPermisosRolDto {
  static readonly schema: z.ZodType<ListarPermisosRolDto> =
    defineZodDto<ListarPermisosRolDto>('ListarPermisosRolDto', {
      limit: {
        schema: z.number().int().min(1).max(200),
        optional: true,
        coerce: 'number',
        defaultValue: 100,
      },
      offset: {
        schema: z.number().int().min(0),
        optional: true,
        coerce: 'number',
        defaultValue: 0,
      },
    });

  limit?: number = 100;

  offset?: number = 0;
}
