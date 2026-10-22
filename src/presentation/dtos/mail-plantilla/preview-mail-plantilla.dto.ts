import { z } from 'zod';
import { defineZodDto, mappedDto } from '../../validation/zod-dto';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PreviewMailPlantillaDto {
  static readonly schema: z.ZodType<PreviewMailPlantillaDto> =
    defineZodDto<PreviewMailPlantillaDto>('PreviewMailPlantillaDto', {
      id: {
        schema: z.number().int(),
        optional: true,
        coerce: 'number',
        description:
          'ID de plantilla guardada. Si se omite, usar slug o cuerpo inline.',
      },
      slug: { schema: z.string(), optional: true, example: 'welcome' },
      asuntoPlantilla: { schema: z.string(), optional: true },
      cuerpoMjml: { schema: z.string(), optional: true },
      cuerpoHtml: { schema: z.string(), optional: true },
      claveLayout: { schema: z.string(), optional: true },
      variables: {
        schema: z.record(z.string(), z.unknown()),
        optional: true,
        description: 'Variables Handlebars para la vista previa',
        example: { name: 'Juan', appName: 'GVR' },
      },
    });

  @ApiPropertyOptional({
    description:
      'ID de plantilla guardada. Si se omite, usar slug o cuerpo inline.',
  })
  id?: number;

  @ApiPropertyOptional({ example: 'welcome' })
  slug?: string;

  @ApiPropertyOptional()
  asuntoPlantilla?: string;

  @ApiPropertyOptional()
  cuerpoMjml?: string;

  @ApiPropertyOptional()
  cuerpoHtml?: string;

  @ApiPropertyOptional({ default: 'base' })
  claveLayout?: string;

  @ApiPropertyOptional({
    description: 'Variables Handlebars para la vista previa',

    example: { name: 'Juan', appName: 'GVR' },
  })
  variables?: Record<string, unknown>;
}

export class TestSendMailPlantillaDto extends PreviewMailPlantillaDto {
  static readonly schema: z.ZodType<TestSendMailPlantillaDto> =
    defineZodDto<TestSendMailPlantillaDto>(
      'TestSendMailPlantillaDto',
      {
        email: { schema: z.string().email(), example: 'usuario@ejemplo.com' },
        nombreDestinatario: { schema: z.string(), optional: true },
      },
      () => mappedDto(PreviewMailPlantillaDto.schema),
    );

  @ApiProperty({ example: 'usuario@ejemplo.com' })
  email!: string;

  @ApiPropertyOptional()
  nombreDestinatario?: string;
}
