import { z } from 'zod';
import { defineZodDto, mappedDto } from '../../../validation/zod-dto';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { ActualizarCalendarioData } from '../../../../domain/repositories/calendarios.repository.interface';
import { RevisionCalendarioDto } from './revision-calendario.dto';

export class ActualizarCalendarioDto
  extends RevisionCalendarioDto
  implements ActualizarCalendarioData
{
  static readonly schema: z.ZodType<ActualizarCalendarioDto> =
    defineZodDto<ActualizarCalendarioDto>(
      'ActualizarCalendarioDto',
      {
        nombre: { schema: z.string().regex(/\S/u).max(120) },
        descripcion: { schema: z.string().max(2000), optional: true },
      },
      () => mappedDto(RevisionCalendarioDto.schema),
    );

  @ApiProperty({ maxLength: 120 })
  nombre: string;

  @ApiPropertyOptional({ maxLength: 2000, default: '' })
  descripcion?: string;
}
