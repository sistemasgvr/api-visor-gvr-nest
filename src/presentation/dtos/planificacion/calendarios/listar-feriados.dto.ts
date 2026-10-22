import { z } from 'zod';
import { defineZodDto, mappedDto } from '../../../validation/zod-dto';
import { ApiPropertyOptional, OmitType } from '@nestjs/swagger';

import { ListarCalendariosDto } from './listar-calendarios.dto';

export class ListarFeriadosDto extends OmitType(ListarCalendariosDto, [
  'busqueda',
] as const) {
  static readonly schema: z.ZodType<ListarFeriadosDto> =
    defineZodDto<ListarFeriadosDto>(
      'ListarFeriadosDto',
      {
        busqueda: { schema: z.string().max(160), optional: true },
        limit: { schema: z.number().optional() },
      },
      () =>
        mappedDto(ListarCalendariosDto.schema, { omit: ['busqueda'] as const }),
    );

  @ApiPropertyOptional({ maxLength: 160 })
  busqueda?: string;

  @ApiPropertyOptional({ default: 12, minimum: 1, maximum: 100 })
  limit?: number;
}
