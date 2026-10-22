import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';

export class ObtenerUrlMiniaturaDto {
  static readonly schema: z.ZodType<ObtenerUrlMiniaturaDto> =
    defineZodDto<ObtenerUrlMiniaturaDto>('ObtenerUrlMiniaturaDto', {
      snapshotUrn: { schema: z.string() },
    });

  snapshotUrn: string;
}
