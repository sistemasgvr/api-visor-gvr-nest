import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';

export class ObtenerTokenPublicoDto {
  static readonly schema: z.ZodType<ObtenerTokenPublicoDto> =
    defineZodDto<ObtenerTokenPublicoDto>('ObtenerTokenPublicoDto', {
      urn: { schema: z.string().min(1) },
    });

  urn: string;
}
