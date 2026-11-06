import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';

export class AnularRevisionDto {
  static readonly schema: z.ZodType<AnularRevisionDto> =
    defineZodDto<AnularRevisionDto>('AnularRevisionDto', {
      notas: { schema: z.string().max(5000), optional: true },
    });

  /**
   * Notas / motivo de anulación (como en ACC: el usuario escribe una nota).
   * Opcional, pero si se envía debe ser texto.
   */

  notas?: string;
}
