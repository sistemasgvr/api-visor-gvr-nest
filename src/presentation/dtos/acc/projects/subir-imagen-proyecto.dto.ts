import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';

export class SubirImagenProyectoDto {
  static readonly schema: z.ZodType<SubirImagenProyectoDto> =
    defineZodDto<SubirImagenProyectoDto>('SubirImagenProyectoDto', {
      token: { schema: z.string(), optional: true },
    });

  token?: string;
}
