import { z } from 'zod';
import { defineZodDto, mappedDto } from '../../../validation/zod-dto';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CalendarioIdParamsDto {
  static readonly schema: z.ZodType<CalendarioIdParamsDto> =
    defineZodDto<CalendarioIdParamsDto>('CalendarioIdParamsDto', {
      id: { schema: z.number().int().min(1).max(2147483647), coerce: 'number' },
    });

  @ApiProperty({ minimum: 1 })
  id: number;
}

export class ExcepcionCalendarioParamsDto extends CalendarioIdParamsDto {
  static readonly schema: z.ZodType<ExcepcionCalendarioParamsDto> =
    defineZodDto<ExcepcionCalendarioParamsDto>(
      'ExcepcionCalendarioParamsDto',
      {
        idexcepcion: {
          schema: z.number().int().min(1).max(2147483647),
          coerce: 'number',
        },
      },
      () => mappedDto(CalendarioIdParamsDto.schema),
    );

  @ApiProperty({ minimum: 1 })
  idexcepcion: number;
}

export class ObtenerCalendarioQueryDto {
  static readonly schema: z.ZodType<ObtenerCalendarioQueryDto> =
    defineZodDto<ObtenerCalendarioQueryDto>('ObtenerCalendarioQueryDto', {
      idversion: {
        schema: z.number().int().min(1).max(2147483647),
        optional: true,
        coerce: 'number',
        description: 'Si se omite: borrador o última publicación.',
      },
    });

  @ApiPropertyOptional({
    minimum: 1,
    description: 'Si se omite: borrador o última publicación.',
  })
  idversion?: number;
}
