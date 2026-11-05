import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';

import { ApiProperty } from '@nestjs/swagger';

export class RevisionCalendarioDto {
  static readonly schema: z.ZodType<RevisionCalendarioDto> =
    defineZodDto<RevisionCalendarioDto>('RevisionCalendarioDto', {
      revision: {
        schema: z.number().int().min(1).max(2147483647),
        coerce: 'number',
        description:
          'Revisión recibida en el último detalle; no es el número de versión.',
      },
    });

  @ApiProperty({
    minimum: 1,
    description:
      'Revisión recibida en el último detalle; no es el número de versión.',
  })
  revision: number;
}
