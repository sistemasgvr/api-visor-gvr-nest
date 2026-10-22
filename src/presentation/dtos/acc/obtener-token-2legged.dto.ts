import { z } from 'zod';
import { defineZodDto } from '../../validation/zod-dto';

export class ObtenerToken2LeggedDto {
  static readonly schema: z.ZodType<ObtenerToken2LeggedDto> =
    defineZodDto<ObtenerToken2LeggedDto>('ObtenerToken2LeggedDto', {
      scopes: { schema: z.array(z.string()), optional: true },
    });

  scopes?: string[];
}
