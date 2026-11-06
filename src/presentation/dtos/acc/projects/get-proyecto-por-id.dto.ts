import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';

export class GetProyectoPorIdDto {
  static readonly schema: z.ZodType<GetProyectoPorIdDto> =
    defineZodDto<GetProyectoPorIdDto>('GetProyectoPorIdDto', {
      fields: { schema: z.string(), optional: true },
      token: { schema: z.string(), optional: true },
    });

  fields?: string;

  token?: string;
}
