import { z } from 'zod';
import { defineZodDto } from '../../validation/zod-dto';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  TIPOS_MARCA_ASISTENCIA,
  type TipoMarcaAsistencia,
} from '../../../domain/entities/asistencia.entity';

export class MarcarAsistenciaDto {
  static readonly schema: z.ZodType<MarcarAsistenciaDto> =
    defineZodDto<MarcarAsistenciaDto>('MarcarAsistenciaDto', {
      tipo: {
        schema: z.enum(
          TIPOS_MARCA_ASISTENCIA as [TipoMarcaAsistencia, ...TipoMarcaAsistencia[]],
        ),
        example: 'ingreso',
        description:
          'Marca a registrar. La hora la pone el servidor (America/Lima).',
      },
      motivo: {
        schema: z.string().max(300),
        optional: true,
        example: 'Falla de internet',
        description:
          'Obligatorio para registrar la salida de un día anterior que quedó sin salida.',
      },
    });

  @ApiProperty({ enum: TIPOS_MARCA_ASISTENCIA, example: 'ingreso' })
  tipo: TipoMarcaAsistencia;

  @ApiPropertyOptional({ maxLength: 300, example: 'Falla de internet' })
  motivo?: string;
}
