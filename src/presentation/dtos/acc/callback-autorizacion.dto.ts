import { z } from 'zod';
import { defineZodDto } from '../../validation/zod-dto';

export class CallbackAutorizacionDto {
  static readonly schema: z.ZodType<CallbackAutorizacionDto> =
    defineZodDto<CallbackAutorizacionDto>('CallbackAutorizacionDto', {
      code: { schema: z.string() },
      state: { schema: z.string() },
      error: { schema: z.string(), optional: true },
      error_description: { schema: z.string(), optional: true },
    });

  code: string;

  state: string;

  error?: string;

  error_description?: string;
}
