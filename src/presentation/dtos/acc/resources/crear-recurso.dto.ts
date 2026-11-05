import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';

export class CrearRecursoDto {
  static readonly schema: z.ZodType<CrearRecursoDto> =
    defineZodDto<CrearRecursoDto>('CrearRecursoDto', {
      external_id: { schema: z.string().min(1) },
      resource_type: { schema: z.string().min(1) },
      name: { schema: z.string().min(1) },
      parent_id: { schema: z.number().int(), optional: true },
      account_id: { schema: z.string(), optional: true },
    });

  external_id: string;

  resource_type: string;

  name: string;

  parent_id?: number;

  account_id?: string;
}
