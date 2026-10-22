import { z } from 'zod';
import { defineZodDto, mappedDto } from '../../../validation/zod-dto';

import { ApiProperty } from '@nestjs/swagger';
import { CrearVersionCalendarioDto } from './crear-version-calendario.dto';

export class DuplicarCalendarioDto extends CrearVersionCalendarioDto {
  static readonly schema: z.ZodType<DuplicarCalendarioDto> =
    defineZodDto<DuplicarCalendarioDto>(
      'DuplicarCalendarioDto',
      {
        nombre: {
          schema: z.string().regex(/\S/u).max(120),
          description:
            'Nombre del nuevo calendario. El origen puede ser borrador o publicación.',
        },
      },
      () => mappedDto(CrearVersionCalendarioDto.schema),
    );

  @ApiProperty({
    maxLength: 120,
    description:
      'Nombre del nuevo calendario. El origen puede ser borrador o publicación.',
  })
  nombre: string;
}
