import { z } from 'zod';
import { defineZodDto, isoDate } from '../../validation/zod-dto';

import { ApiProperty } from '@nestjs/swagger';

export class HabilitarJornadasUsuariosDto {
  static readonly schema: z.ZodType<HabilitarJornadasUsuariosDto> =
    defineZodDto<HabilitarJornadasUsuariosDto>('HabilitarJornadasUsuariosDto', {
      idTrabajadores: {
        schema: z.array(z.number().int().min(1).max(2147483647)).min(1),
        description: 'IDs de tratrabajador de la pantalla Usuarios',
        example: [101, 102],
      },
      fechaInicio: {
        schema: z
          .string()
          .refine((value) => isoDate(value, true), {
            message: 'Debe ser una fecha ISO válida',
          })
          .meta({ format: 'date-time' })
          .regex(/^\d{4}-\d{2}-\d{2}$/),
        example: '2026-10-12',
      },
      fechaFin: {
        schema: z
          .string()
          .refine((value) => isoDate(value, true), {
            message: 'Debe ser una fecha ISO válida',
          })
          .meta({ format: 'date-time' })
          .regex(/^\d{4}-\d{2}-\d{2}$/),
        example: '2026-10-16',
      },
      duracionMinutos: {
        schema: z.number().int().min(1).max(2147483647),
        example: 120,
        description: 'Minutos desde la confirmación de la habilitación',
      },
    });

  @ApiProperty({
    type: [Number],
    description: 'IDs de tratrabajador de la pantalla Usuarios',
    example: [101, 102],
  })
  idTrabajadores: number[];

  @ApiProperty({ example: '2026-10-12' })
  fechaInicio: string;

  @ApiProperty({ example: '2026-10-16' })
  fechaFin: string;

  @ApiProperty({
    example: 120,
    description: 'Minutos desde la confirmación de la habilitación',
    minimum: 1,
  })
  duracionMinutos: number;
}
