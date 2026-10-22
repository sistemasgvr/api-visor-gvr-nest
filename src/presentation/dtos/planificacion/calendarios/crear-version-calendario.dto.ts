import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';

import { ApiProperty } from '@nestjs/swagger';

export class CrearVersionCalendarioDto {
  static readonly schema: z.ZodType<CrearVersionCalendarioDto> =
    defineZodDto<CrearVersionCalendarioDto>('CrearVersionCalendarioDto', {
      idversionorigen: {
        schema: z.number().int().min(1).max(2147483647),
        description: 'Versión publicada de origen.',
      },
    });

  @ApiProperty({ minimum: 1, description: 'Versión publicada de origen.' })
  idversionorigen: number;
}
