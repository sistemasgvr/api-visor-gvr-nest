import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';

export class ObtenerCarpetasPrincipalesDto {
  static readonly schema: z.ZodType<ObtenerCarpetasPrincipalesDto> =
    defineZodDto<ObtenerCarpetasPrincipalesDto>(
      'ObtenerCarpetasPrincipalesDto',
      {
        filters: { schema: z.record(z.string(), z.unknown()), optional: true },
      },
    );

  filters?: Record<string, any>;
}
