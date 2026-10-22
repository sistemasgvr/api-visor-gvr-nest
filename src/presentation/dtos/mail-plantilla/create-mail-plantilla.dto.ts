import { z } from 'zod';
import { defineZodDto } from '../../validation/zod-dto';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MailTemplateVariableDto } from './mail-template-variable.dto';

export class CreateMailPlantillaDto {
  static readonly schema: z.ZodType<CreateMailPlantillaDto> =
    defineZodDto<CreateMailPlantillaDto>('CreateMailPlantillaDto', {
      slug: {
        schema: z
          .string()
          .min(1)
          .max(128)
          .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
        example: 'welcome',
      },
      nombre: { schema: z.string().min(1).max(255), example: 'Bienvenida' },
      asuntoPlantilla: {
        schema: z.string().min(1).max(500),
        example: 'Bienvenido a {{appName}}',
      },
      descripcion: { schema: z.string(), optional: true },
      cuerpoMjml: {
        schema: z.string(),
        optional: true,
        description: 'MJML (GrapesJS). Si se envía, se compila a HTML.',
      },
      cuerpoHtml: {
        schema: z.string(),
        optional: true,
        description: 'HTML ya compilado (opcional si hay MJML)',
      },
      designJson: {
        schema: z.record(z.string(), z.unknown()),
        optional: true,
        description: 'Proyecto GrapesJS (JSON)',
      },
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
      esSistema: { schema: z.boolean(), optional: true },
    });

  @ApiProperty({ example: 'welcome' })
  slug!: string;

  @ApiProperty({ example: 'Bienvenida' })
  nombre!: string;

  @ApiProperty({ example: 'Bienvenido a {{appName}}' })
  asuntoPlantilla!: string;

  @ApiPropertyOptional()
  descripcion?: string;

  @ApiPropertyOptional({
    description: 'MJML (GrapesJS). Si se envía, se compila a HTML.',
  })
  cuerpoMjml?: string;

  @ApiPropertyOptional({
    description: 'HTML ya compilado (opcional si hay MJML)',
  })
  cuerpoHtml?: string;

  @ApiPropertyOptional({ description: 'Proyecto GrapesJS (JSON)' })
  designJson?: Record<string, unknown>;

  @ApiPropertyOptional({ type: [MailTemplateVariableDto] })
  esquemaVariables?: MailTemplateVariableDto[];

  @ApiPropertyOptional({
    description:
      'Valores JSON para vista previa / envío de prueba en el editor admin',
    example: { name: 'Juan', appName: 'GVR' },
  })
  variablesPrueba?: Record<string, unknown>;

  @ApiPropertyOptional({ default: 'base' })
  claveLayout?: string;

  @ApiPropertyOptional({ default: false })
  esSistema?: boolean;
}
