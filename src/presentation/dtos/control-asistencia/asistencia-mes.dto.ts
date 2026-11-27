import { z } from 'zod';
import { defineZodDto } from '../../validation/zod-dto';

import { ApiProperty } from '@nestjs/swagger';

export class AsistenciaMesQueryDto {
  static readonly schema: z.ZodType<AsistenciaMesQueryDto> =
    defineZodDto<AsistenciaMesQueryDto>('AsistenciaMesQueryDto', {
      anio: {
        schema: z.number().int().min(2000).max(2100),
        coerce: 'number',
        example: 2026,
      },
      mes: {
        schema: z.number().int().min(1).max(12),
        coerce: 'number',
        example: 11,
      },
    });

  @ApiProperty({ minimum: 2000, maximum: 2100, example: 2026 })
  anio: number;

  @ApiProperty({ minimum: 1, maximum: 12, example: 11 })
  mes: number;
}

export class AsistenciaTrabajadorParamsDto {
  static readonly schema: z.ZodType<AsistenciaTrabajadorParamsDto> =
    defineZodDto<AsistenciaTrabajadorParamsDto>(
      'AsistenciaTrabajadorParamsDto',
      {
        idTrabajador: {
          schema: z.number().int().min(1).max(2147483647),
          coerce: 'number',
        },
      },
    );

  @ApiProperty({ minimum: 1 })
  idTrabajador: number;
}
