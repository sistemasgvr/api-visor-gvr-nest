import { z } from 'zod';
import { defineZodDto } from '../../validation/zod-dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ActualizarEstadoJornadaDto {
  static readonly schema: z.ZodType<ActualizarEstadoJornadaDto> =
    defineZodDto<ActualizarEstadoJornadaDto>('ActualizarEstadoJornadaDto', {
      idEstadoJornada: {
        schema: z
          .number()
          .int()
          .refine(
            (value) =>
              ([372, 373, 398, 399, 400, 401] as readonly unknown[]).includes(
                value,
              ),
            { message: 'Seleccione una opción válida' },
          )
          .meta({ enum: [372, 373, 398, 399, 400, 401] }),
      },
      duracionMinutos: {
        schema: z.number().int().min(1).max(2147483647),
        when: (dto: ActualizarEstadoJornadaDto) =>
          dto.idEstadoJornada === 372 || dto.duracionMinutos !== undefined,
        example: 120,
        description: 'Obligatorio para abrir una jornada (estado 372)',
      },
    });

  @ApiProperty({ enum: [372, 373, 398, 399, 400, 401] })
  idEstadoJornada: number;

  @ApiPropertyOptional({
    example: 120,
    description: 'Obligatorio para abrir una jornada (estado 372)',
    minimum: 1,
  })
  duracionMinutos?: number;
}
