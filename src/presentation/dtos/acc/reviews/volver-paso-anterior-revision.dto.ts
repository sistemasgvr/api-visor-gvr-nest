import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';

export class VolverPasoAnteriorRevisionDto {
  static readonly schema: z.ZodType<VolverPasoAnteriorRevisionDto> =
    defineZodDto<VolverPasoAnteriorRevisionDto>(
      'VolverPasoAnteriorRevisionDto',
      { notas: { schema: z.string(), optional: true } },
    );

  notas?: string;
}
