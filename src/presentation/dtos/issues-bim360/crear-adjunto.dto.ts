import { z } from 'zod';
import { defineZodDto } from '../../validation/zod-dto';

export class CrearAdjuntoDto {
  static readonly schema: z.ZodType<CrearAdjuntoDto> =
    defineZodDto<CrearAdjuntoDto>('issues-bim360_CrearAdjuntoDto', {
      urn: { schema: z.string(), optional: true },
      name: { schema: z.string(), optional: true },
      fileName: { schema: z.string(), optional: true },
      displayName: { schema: z.string(), optional: true },
      type: { schema: z.string(), optional: true },
      data: { schema: z.record(z.string(), z.unknown()), optional: true },
    });

  urn?: string;

  name?: string;

  fileName?: string;

  displayName?: string;

  type?: string;

  data?: Record<string, any>;
}
