import { z } from 'zod';
import { defineZodDto } from '../../validation/zod-dto';

export class ObtenerHubsDto {
  static readonly schema: z.ZodType<ObtenerHubsDto> =
    defineZodDto<ObtenerHubsDto>('ObtenerHubsDto', {
      filters: { schema: z.record(z.string(), z.unknown()), optional: true },
    });

  filters?: {
    id?: string;
    name?: string;
    'extension.type'?: string;
  };
}
