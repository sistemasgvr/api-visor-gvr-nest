import { z } from 'zod';
import { defineZodDto } from '../../validation/zod-dto';

import { ApiPropertyOptional } from '@nestjs/swagger';

export class ListMailPlantillaQueryDto {
  static readonly schema: z.ZodType<ListMailPlantillaQueryDto> =
    defineZodDto<ListMailPlantillaQueryDto>('ListMailPlantillaQueryDto', {
      busqueda: { schema: z.string(), optional: true },
      soloActivas: {
        schema: z.boolean(),
        optional: true,
        coerce: 'boolean',
        defaultValue: true,
      },
      limit: {
        schema: z.number().int().min(1),
        optional: true,
        coerce: 'number',
        defaultValue: 50,
      },
      offset: {
        schema: z.number().int().min(0),
        optional: true,
        coerce: 'number',
        defaultValue: 0,
      },
    });

  @ApiPropertyOptional()
  busqueda?: string;

  @ApiPropertyOptional({ default: true })
  soloActivas?: boolean = true;

  @ApiPropertyOptional({ default: 50 })
  limit?: number = 50;

  @ApiPropertyOptional({ default: 0 })
  offset?: number = 0;
}
