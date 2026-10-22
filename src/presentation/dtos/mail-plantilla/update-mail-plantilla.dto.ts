import { z } from 'zod';
import { defineZodDto } from '../../validation/zod-dto';

import { ApiPropertyOptional } from '@nestjs/swagger';
import { MailTemplateVariableDto } from './mail-template-variable.dto';

export class UpdateMailPlantillaDto {
  static readonly schema: z.ZodType<UpdateMailPlantillaDto> =
    defineZodDto<UpdateMailPlantillaDto>('UpdateMailPlantillaDto', {
      nombre: { schema: z.string().min(1).max(255), optional: true },
      descripcion: { schema: z.string(), optional: true },
      asuntoPlantilla: { schema: z.string().min(1).max(500), optional: true },
      cuerpoMjml: { schema: z.string(), optional: true },
      cuerpoHtml: { schema: z.string(), optional: true },
      designJson: { schema: z.record(z.string(), z.unknown()), optional: true },
      esquemaVariables: {
        schema: z.array(z.lazy(() => MailTemplateVariableDto.schema)),
        optional: true,
      },
      variablesPrueba: {
        schema: z.record(z.string(), z.unknown()),
        optional: true,
        description:
          'Valores JSON para vista previa / envío de prueba en el editor admin',
        example: { name: 'Juan', appName: 'GVR' },
      },
      claveLayout: { schema: z.string().max(64), optional: true },
      estado: { schema: z.number().int(), optional: true },
    });

  @ApiPropertyOptional()
  nombre?: string;

  @ApiPropertyOptional()
  descripcion?: string;

  @ApiPropertyOptional()
  asuntoPlantilla?: string;

  @ApiPropertyOptional()
  cuerpoMjml?: string;

  @ApiPropertyOptional()
  cuerpoHtml?: string;

  @ApiPropertyOptional()
  designJson?: Record<string, unknown> | null;

  @ApiPropertyOptional({ type: [MailTemplateVariableDto] })
  esquemaVariables?: MailTemplateVariableDto[];

  @ApiPropertyOptional({
    description:
      'Valores JSON para vista previa / envío de prueba en el editor admin',
    example: { name: 'Juan', appName: 'GVR' },
  })
  variablesPrueba?: Record<string, unknown>;

  @ApiPropertyOptional()
  claveLayout?: string;

  @ApiPropertyOptional({ enum: [0, 1] })
  estado?: number;
}
