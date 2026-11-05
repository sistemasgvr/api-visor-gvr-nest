import { z } from 'zod';
import { defineZodDto, mergeDtos } from '../../../validation/zod-dto';
import { IntersectionType } from '@nestjs/swagger';
import { CrearFeriadoDto } from './crear-feriado.dto';
import { RevisionCalendarioDto } from './revision-calendario.dto';

export class ActualizarFeriadoDto extends IntersectionType(
  CrearFeriadoDto,
  RevisionCalendarioDto,
) {
  static readonly schema: z.ZodType<ActualizarFeriadoDto> =
    defineZodDto<ActualizarFeriadoDto>('ActualizarFeriadoDto', {}, () =>
      mergeDtos(CrearFeriadoDto.schema, RevisionCalendarioDto.schema),
    );
}
