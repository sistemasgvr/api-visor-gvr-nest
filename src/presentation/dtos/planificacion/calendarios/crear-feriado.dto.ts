import { z } from 'zod';
import { defineZodDto, mappedDto } from '../../../validation/zod-dto';
import { ApiProperty, OmitType } from '@nestjs/swagger';

import { GuardarExcepcionCalendarioDto } from './guardar-excepcion-calendario.dto';
import type { GuardarFeriadoData } from '../../../../domain/repositories/calendarios.repository.interface';

export class CrearFeriadoDto
  extends OmitType(GuardarExcepcionCalendarioDto, ['revision'] as const)
  implements GuardarFeriadoData
{
  static readonly schema: z.ZodType<CrearFeriadoDto> =
    defineZodDto<CrearFeriadoDto>(
      'CrearFeriadoDto',
      {
        idcalendarios: {
          schema: z
            .array(z.number().int().min(1).max(2147483647))
            .refine(
              (values) => {
                const keys = values.map((value) => value);
                return new Set(keys).size === keys.length;
              },
              { message: 'No se permiten valores repetidos' },
            )
            .meta({ uniqueItems: true }),
          example: [1, 2],
          description:
            'Selección completa de calendarios, sin duplicados. [] permite guardar sin asignaciones.',
        },
      },
      () =>
        mappedDto(GuardarExcepcionCalendarioDto.schema, {
          omit: ['revision'] as const,
        }),
    );

  @ApiProperty({
    type: [Number],
    example: [1, 2],
    description:
      'Selección completa de calendarios, sin duplicados. [] permite guardar sin asignaciones.',
  })
  idcalendarios: number[];
}
