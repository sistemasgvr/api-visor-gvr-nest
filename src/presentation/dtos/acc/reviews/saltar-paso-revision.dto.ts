import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';

export class SaltarPasoRevisionDto {
  static readonly schema: z.ZodType<SaltarPasoRevisionDto> =
    defineZodDto<SaltarPasoRevisionDto>('SaltarPasoRevisionDto', {
      notas: { schema: z.string(), optional: true },
    });

  notas?: string;
}
