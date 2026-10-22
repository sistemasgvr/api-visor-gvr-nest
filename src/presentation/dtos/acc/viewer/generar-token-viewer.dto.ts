import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';

export class GenerarTokenViewerDto {
  static readonly schema: z.ZodType<GenerarTokenViewerDto> =
    defineZodDto<GenerarTokenViewerDto>('GenerarTokenViewerDto', {
      scope: { schema: z.string(), optional: true },
    });

  scope?: string;
}
