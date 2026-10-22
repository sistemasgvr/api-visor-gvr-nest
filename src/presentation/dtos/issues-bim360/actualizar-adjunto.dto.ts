import { z } from 'zod';
import { defineZodDto } from '../../validation/zod-dto';

export class ActualizarAdjuntoDto {
  static readonly schema: z.ZodType<ActualizarAdjuntoDto> =
    defineZodDto<ActualizarAdjuntoDto>('ActualizarAdjuntoDto', {
      name: { schema: z.string(), optional: true },
      displayName: { schema: z.string(), optional: true },
      data: { schema: z.record(z.string(), z.unknown()), optional: true },
    });

  name?: string;

  displayName?: string;

  data?: Record<string, any>;
}
