import { z } from 'zod';
import { defineZodDto, mappedDto } from '../../../validation/zod-dto';

import { ApiProperty } from '@nestjs/swagger';
import type { EstadoCalendario } from '../../../../domain/entities/calendario.entity';
import { RevisionCalendarioDto } from './revision-calendario.dto';

export class CambiarEstadoCalendarioDto extends RevisionCalendarioDto {
  static readonly schema: z.ZodType<CambiarEstadoCalendarioDto> =
    defineZodDto<CambiarEstadoCalendarioDto>(
      'CambiarEstadoCalendarioDto',
      {
        estado: {
          schema: z
            .number()
            .int()
            .refine((value) => ([0, 1] as readonly unknown[]).includes(value), {
              message: 'Seleccione una opción válida',
            })
            .meta({ enum: [0, 1] }),
          description: '0 inactivo, 1 activo.',
        },
      },
      () => mappedDto(RevisionCalendarioDto.schema),
    );

  @ApiProperty({ enum: [0, 1], description: '0 inactivo, 1 activo.' })
  estado: EstadoCalendario;
}
