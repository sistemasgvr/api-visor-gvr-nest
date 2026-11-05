import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { CrearCalendarioData } from '../../../../domain/repositories/calendarios.repository.interface';

export class CrearCalendarioDto implements CrearCalendarioData {
  static readonly schema: z.ZodType<CrearCalendarioDto> =
    defineZodDto<CrearCalendarioDto>('CrearCalendarioDto', {
      nombre: {
        schema: z.string().regex(/\S/u).max(120),
        example: 'Consultoría remota',
      },
      descripcion: { schema: z.string().max(2000), optional: true },
      zonahoraria: {
        schema: z.string().regex(/^\S+$/u).max(100),
        optional: true,
      },
    });

  @ApiProperty({ maxLength: 120, example: 'Consultoría remota' })
  nombre: string;

  @ApiPropertyOptional({ maxLength: 2000 })
  descripcion?: string;

  @ApiPropertyOptional({ default: 'America/Lima', maxLength: 100 })
  zonahoraria?: string;
}
