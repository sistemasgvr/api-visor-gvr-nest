import { z } from 'zod';
import { defineZodDto } from '../../validation/zod-dto';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ReenviarMailEnvioDto {
  static readonly schema: z.ZodType<ReenviarMailEnvioDto> =
    defineZodDto<ReenviarMailEnvioDto>('ReenviarMailEnvioDto', {
      templateId: { schema: z.string(), example: 'welcome' },
      idTrabajador: {
        schema: z.number().int().min(1),
        coerce: 'number',
        example: 42,
      },
    });

  @ApiProperty({ example: 'welcome' })
  templateId!: string;

  @ApiProperty({ example: 42 })
  idTrabajador!: number;
}

export class ReenviarPendientesMailEnvioDto {
  static readonly schema: z.ZodType<ReenviarPendientesMailEnvioDto> =
    defineZodDto<ReenviarPendientesMailEnvioDto>(
      'ReenviarPendientesMailEnvioDto',
      {
        templateId: { schema: z.string(), example: 'welcome' },
        idTrabajadores: {
          schema: z.array(z.number().int()),
          optional: true,
          coerce: 'number',
          description:
            'IDs específicos; si se omite, reenvía todos los pendientes/fallidos',
        },
      },
    );

  @ApiProperty({ example: 'welcome' })
  templateId!: string;

  @ApiPropertyOptional({
    description:
      'IDs específicos; si se omite, reenvía todos los pendientes/fallidos',
  })
  idTrabajadores?: number[];
}
