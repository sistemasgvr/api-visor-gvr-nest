import { z } from 'zod';
import { defineZodDto, mappedDto, isoDate } from '../../../validation/zod-dto';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { GuardarExcepcionCalendarioData } from '../../../../domain/repositories/calendarios.repository.interface';
import { RevisionCalendarioDto } from './revision-calendario.dto';

export class GuardarExcepcionCalendarioDto
  extends RevisionCalendarioDto
  implements GuardarExcepcionCalendarioData
{
  static readonly schema: z.ZodType<GuardarExcepcionCalendarioDto> =
    defineZodDto<GuardarExcepcionCalendarioDto>(
      'GuardarExcepcionCalendarioDto',
      {
        fecha: {
          schema: z
            .string()
            .refine((value) => isoDate(value, true), {
              message: 'Debe ser una fecha ISO válida',
            })
            .meta({ format: 'date-time' })
            .regex(/^(?!0000)[0-9]{4}-[0-9]{2}-[0-9]{2}$/),
          example: '2026-12-24',
          description: 'Fecha local, sin componente horario.',
        },
        nombre: { schema: z.string().regex(/\S/u).max(160) },
        idtipo: {
          schema: z.number().int().min(1).max(2147483647),
          example: 617,
          description:
            'ID de una opción activa de la lista 48 (tipo de excepción de calendario).',
        },
        minutosefectivos: {
          schema: z.number().int().min(0).max(1439),
          description: '0=feriado completo; >0=límite de minutos del día.',
        },
        activo: {
          schema: z.boolean(),
          when: (_object, value: unknown) => value !== undefined,
        },
      },
      () => mappedDto(RevisionCalendarioDto.schema),
    );

  @ApiProperty({
    example: '2026-12-24',
    description: 'Fecha local, sin componente horario.',
  })
  fecha: string;

  @ApiProperty({ maxLength: 160 })
  nombre: string;

  @ApiProperty({
    example: 617,
    minimum: 1,
    maximum: 2147483647,
    description:
      'ID de una opción activa de la lista 48 (tipo de excepción de calendario).',
  })
  idtipo: number;

  @ApiProperty({
    minimum: 0,
    maximum: 1439,
    description: '0=feriado completo; >0=límite de minutos del día.',
  })
  minutosefectivos: number;

  @ApiPropertyOptional({ default: true })
  activo?: boolean;
}
