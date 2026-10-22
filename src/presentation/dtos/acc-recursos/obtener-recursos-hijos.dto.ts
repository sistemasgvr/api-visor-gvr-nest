import { z } from 'zod';
import { defineZodDto } from '../../validation/zod-dto';

export class ObtenerRecursosHijosDto {
  static readonly schema: z.ZodType<ObtenerRecursosHijosDto> =
    defineZodDto<ObtenerRecursosHijosDto>('ObtenerRecursosHijosDto', {
      tipo: { schema: z.string(), optional: true },
    });

  tipo?: string;
}
