import { z } from 'zod';
import { defineZodDto, mappedDto } from '../../../validation/zod-dto';

import { ApiProperty } from '@nestjs/swagger';
import type { ConfiguracionDiaCalendario } from '../../../../domain/entities/calendario.entity';
import type { GuardarSemanaCalendarioData } from '../../../../domain/repositories/calendarios.repository.interface';
import { RevisionCalendarioDto } from './revision-calendario.dto';

export class DiaSemanaCalendarioDto implements ConfiguracionDiaCalendario {
  static readonly schema: z.ZodType<DiaSemanaCalendarioDto> =
    defineZodDto<DiaSemanaCalendarioDto>('DiaSemanaCalendarioDto', {
      diasemana: {
        schema: z.number().int().min(1).max(7),
        description: 'Lunes=1, domingo=7.',
      },
      laborable: { schema: z.boolean() },
      horaentrada: {
        schema: z.string().regex(/^([01][0-9]|2[0-3]):[0-5][0-9]$/),
        when: (dia: DiaSemanaCalendarioDto) =>
          dia.laborable || dia.horaentrada != null,
        example: '08:00',
      },
      horasalida: {
        schema: z.string().regex(/^([01][0-9]|2[0-3]):[0-5][0-9]$/),
        when: (dia: DiaSemanaCalendarioDto) =>
          dia.laborable || dia.horasalida != null,
        example: '17:00',
      },
      minutosrefrigerio: {
        schema: z.number().int().min(0).max(1439),
        example: 60,
      },
    });

  @ApiProperty({ minimum: 1, maximum: 7, description: 'Lunes=1, domingo=7.' })
  diasemana: number;

  @ApiProperty()
  laborable: boolean;

  @ApiProperty({ nullable: true, example: '08:00' })
  horaentrada: string | null;

  @ApiProperty({ nullable: true, example: '17:00' })
  horasalida: string | null;

  @ApiProperty({ minimum: 0, maximum: 1439, example: 60 })
  minutosrefrigerio: number;
}

export class GuardarSemanaCalendarioDto
  extends RevisionCalendarioDto
  implements GuardarSemanaCalendarioData
{
  static readonly schema: z.ZodType<GuardarSemanaCalendarioDto> =
    defineZodDto<GuardarSemanaCalendarioDto>(
      'GuardarSemanaCalendarioDto',
      {
        zonahoraria: {
          schema: z.string().regex(/^\S+$/u).max(100),
          example: 'America/Lima',
        },
        semana: {
          schema: z
            .array(z.lazy(() => DiaSemanaCalendarioDto.schema))
            .min(7)
            .max(7)
            .refine(
              (values) => {
                const keys = values.map(
                  (dia: DiaSemanaCalendarioDto | null) => dia?.diasemana,
                );
                return new Set(keys).size === keys.length;
              },
              { message: 'No se permiten valores repetidos' },
            )
            .meta({ 'x-unique-by': 'diasemana' }),
        },
      },
      () => mappedDto(RevisionCalendarioDto.schema),
    );

  @ApiProperty({ example: 'America/Lima', maxLength: 100 })
  zonahoraria: string;

  @ApiProperty({ type: [DiaSemanaCalendarioDto], minItems: 7, maxItems: 7 })
  semana: DiaSemanaCalendarioDto[];
}
