import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';

import { ApiPropertyOptional } from '@nestjs/swagger';
import type { EstadoCalendario } from '../../../../domain/entities/calendario.entity';

export class ListarCalendariosDto {
  static readonly schema: z.ZodType<ListarCalendariosDto> =
    defineZodDto<ListarCalendariosDto>('ListarCalendariosDto', {
      busqueda: { schema: z.string().max(200), optional: true },
      estado: {
        schema: z
          .number()
          .int()
          .refine((value) => ([0, 1] as readonly unknown[]).includes(value), {
            message: 'Seleccione una opción válida',
          })
          .meta({ enum: [0, 1] }),
        optional: true,
        coerce: 'number',
      },
      limit: {
        schema: z.number().int().min(1).max(100),
        optional: true,
        coerce: 'number',
      },
      offset: {
        schema: z.number().int().min(0).max(2147483647),
        optional: true,
        coerce: 'number',
      },
    });

  @ApiPropertyOptional({ maxLength: 200 })
  busqueda?: string;

  @ApiPropertyOptional({ enum: [0, 1] })
  estado?: EstadoCalendario;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  limit?: number;

  @ApiPropertyOptional({ default: 0, minimum: 0 })
  offset?: number;
}
