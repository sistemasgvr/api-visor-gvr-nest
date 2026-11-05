import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';

export class ActualizarRecursoDto {
  static readonly schema: z.ZodType<ActualizarRecursoDto> =
    defineZodDto<ActualizarRecursoDto>('acc_resources_ActualizarRecursoDto', {
      name: { schema: z.string().min(1) },
      parent_id: { schema: z.number().int(), optional: true },
      account_id: { schema: z.string(), optional: true },
    });

  name: string;

  parent_id?: number;

  account_id?: string;
}
