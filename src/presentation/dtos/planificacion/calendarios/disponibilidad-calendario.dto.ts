import { z } from 'zod';
import { defineZodDto, isoDate } from '../../../validation/zod-dto';

import { ApiProperty } from '@nestjs/swagger';

export class DisponibilidadCalendarioDto {
  static readonly schema: z.ZodType<DisponibilidadCalendarioDto> =
    defineZodDto<DisponibilidadCalendarioDto>('DisponibilidadCalendarioDto', {
      desde: {
        schema: z
          .string()
          .refine((value) => isoDate(value, true), {
            message: 'Debe ser una fecha ISO válida',
          })
          .meta({ format: 'date-time' })
          .regex(/^(?!0000)[0-9]{4}-[0-9]{2}-[0-9]{2}$/),
        example: '2026-10-01',
      },
      hasta: {
        schema: z
          .string()
          .refine((value) => isoDate(value, true), {
            message: 'Debe ser una fecha ISO válida',
          })
          .meta({ format: 'date-time' })
          .regex(/^(?!0000)[0-9]{4}-[0-9]{2}-[0-9]{2}$/),
        example: '2026-10-31',
        description: 'Fin inclusivo; máximo 366 días.',
      },
    });

  @ApiProperty({ example: '2026-10-01' })
  desde: string;

  @ApiProperty({
    example: '2026-10-31',
    description: 'Fin inclusivo; máximo 366 días.',
  })
  hasta: string;
}
