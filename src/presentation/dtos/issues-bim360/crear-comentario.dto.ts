import { z } from 'zod';
import { defineZodDto } from '../../validation/zod-dto';

export class CrearComentarioDto {
  static readonly schema: z.ZodType<CrearComentarioDto> =
    defineZodDto<CrearComentarioDto>('issues-bim360_CrearComentarioDto', {
      body: { schema: z.string() },
    });

  body: string;
}
