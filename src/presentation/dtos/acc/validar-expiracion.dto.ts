import { z } from 'zod';
import { defineZodDto, isoDate } from '../../validation/zod-dto';

export class ValidarExpiracionDto {
  static readonly schema: z.ZodType<ValidarExpiracionDto> =
    defineZodDto<ValidarExpiracionDto>('ValidarExpiracionDto', {
      expires_at: {
        schema: z
          .string()
          .refine((value) => isoDate(value, false), {
            message: 'Debe ser una fecha ISO válida',
          })
          .meta({ format: 'date-time' }),
      },
    });

  expires_at: string;
}
