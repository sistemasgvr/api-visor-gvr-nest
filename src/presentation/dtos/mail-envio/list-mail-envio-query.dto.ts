import { z } from 'zod';
import { defineZodDto } from '../../validation/zod-dto';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ListMailEnvioCoberturaQueryDto {
  static readonly schema: z.ZodType<ListMailEnvioCoberturaQueryDto> =
    defineZodDto<ListMailEnvioCoberturaQueryDto>(
      'ListMailEnvioCoberturaQueryDto',
      {
        templateId: { schema: z.string(), example: 'welcome' },
        busqueda: {
          schema: z.string(),
          optional: true,
          transforms: [({ value }) => (value === '' ? undefined : value)],
        },
        estadoEnvio: {
          schema: z
            .string()
            .refine(
              (value) =>
                (
                  [
                    'sent',
                    'failed',
                    'skipped',
                    'no_enviado',
                    'no_aplica',
                  ] as readonly unknown[]
                ).includes(value),
              { message: 'Seleccione una opción válida' },
            )
            .meta({
              enum: ['sent', 'failed', 'skipped', 'no_enviado', 'no_aplica'],
            }),
          optional: true,
          transforms: [({ value }) => (value === '' ? undefined : value)],
        },
        limit: {
          schema: z.number().int().min(1),
          optional: true,
          coerce: 'number',
          defaultValue: 20,
        },
        offset: {
          schema: z.number().int().min(0),
          optional: true,
          coerce: 'number',
          defaultValue: 0,
        },
      },
    );

  @ApiProperty({ example: 'welcome' })
  templateId!: string;

  @ApiPropertyOptional()
  busqueda?: string;

  @ApiPropertyOptional({
    enum: ['sent', 'failed', 'skipped', 'no_enviado', 'no_aplica'],
  })
  estadoEnvio?: string;

  @ApiPropertyOptional({ default: 20 })
  limit?: number = 20;

  @ApiPropertyOptional({ default: 0 })
  offset?: number = 0;
}

export class ListMailEnvioLogsQueryDto {
  static readonly schema: z.ZodType<ListMailEnvioLogsQueryDto> =
    defineZodDto<ListMailEnvioLogsQueryDto>('ListMailEnvioLogsQueryDto', {
      templateId: {
        schema: z.string(),
        optional: true,
        transforms: [({ value }) => (value === '' ? undefined : value)],
      },
      busqueda: {
        schema: z.string(),
        optional: true,
        transforms: [({ value }) => (value === '' ? undefined : value)],
      },
      status: {
        schema: z
          .string()
          .refine(
            (value) =>
              (['sent', 'failed', 'skipped'] as readonly unknown[]).includes(
                value,
              ),
            { message: 'Seleccione una opción válida' },
          )
          .meta({ enum: ['sent', 'failed', 'skipped'] }),
        optional: true,
        transforms: [({ value }) => (value === '' ? undefined : value)],
      },
      limit: {
        schema: z.number().int().min(1),
        optional: true,
        coerce: 'number',
        defaultValue: 20,
      },
      offset: {
        schema: z.number().int().min(0),
        optional: true,
        coerce: 'number',
        defaultValue: 0,
      },
    });

  @ApiPropertyOptional()
  templateId?: string;

  @ApiPropertyOptional()
  busqueda?: string;

  @ApiPropertyOptional({ enum: ['sent', 'failed', 'skipped'] })
  status?: string;

  @ApiPropertyOptional({ default: 20 })
  limit?: number = 20;

  @ApiPropertyOptional({ default: 0 })
  offset?: number = 0;
}
