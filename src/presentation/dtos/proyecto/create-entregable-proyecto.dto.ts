import { z } from 'zod';
import { defineZodDto, isoDate } from '../../validation/zod-dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import {
  ID_ESTADO_ENTREGABLE_PROCESO,
  ID_LISTA_ESTADO_ENTREGABLE,
} from '../../../domain/constants/estado-entregable.constants';

export class CreateEntregableProyectoDto {
  static readonly schema: z.ZodType<CreateEntregableProyectoDto> =
    defineZodDto<CreateEntregableProyectoDto>('CreateEntregableProyectoDto', {
      idProyecto: {
        schema: z.number().int(),
        example: 1,
        description: 'ID del proyecto GVR (proProyecto)',
      },
      nombre: { schema: z.string().max(255), example: 'Entrega fase 1' },
      descripcion: {
        schema: z.string().max(1000),
        optional: true,
        example: 'Planos y memorias',
      },
      idEstado: {
        schema: z.number().int(),
        optional: true,
        example: ID_ESTADO_ENTREGABLE_PROCESO,
        description: `Estado del entregable (genListado idLista ${ID_LISTA_ESTADO_ENTREGABLE}). Por defecto ${ID_ESTADO_ENTREGABLE_PROCESO} = PROCESO`,
      },
      fechaEstimada: {
        schema: z
          .string()
          .refine((value) => isoDate(value, false), {
            message: 'Debe ser una fecha ISO válida',
          })
          .meta({ format: 'date-time' }),
        optional: true,
        example: '2026-06-15T00:00:00.000Z',
        description: 'Fecha estimada de entrega (ISO 8601)',
      },
      fechaEntrega: {
        schema: z
          .string()
          .refine((value) => isoDate(value, false), {
            message: 'Debe ser una fecha ISO válida',
          })
          .meta({ format: 'date-time' }),
        optional: true,
        example: '2026-06-20T00:00:00.000Z',
        description: 'Fecha real de entrega (ISO 8601)',
      },
      idTrabajadoresResponsables: {
        schema: z.array(z.number().int()),
        optional: true,
        coerce: 'number',
        example: [42],
        description:
          'IDs de trabajadores responsables (traTrabajador). Contrato preferido Fase 4. El primero queda como principal en SQL.',
      },
      idTrabajadorResponsable: {
        schema: z.number().int(),
        optional: true,
        example: 42,
        description:
          'Atajo v1 (un solo responsable). Si viene `idTrabajadoresResponsables`, este campo se ignora.',
      },
      revisionPlan: { schema: z.number().int().min(1), optional: true },
      motivo: { schema: z.string().max(1000), optional: true },
      orden: { schema: z.number().int().min(0), optional: true },
    });

  @ApiProperty({ example: 1, description: 'ID del proyecto GVR (proProyecto)' })
  idProyecto: number;

  @ApiProperty({ example: 'Entrega fase 1', maxLength: 255 })
  nombre: string;

  @ApiPropertyOptional({ example: 'Planos y memorias', maxLength: 1000 })
  descripcion?: string;

  @ApiPropertyOptional({
    example: ID_ESTADO_ENTREGABLE_PROCESO,
    description: `Estado del entregable (genListado idLista ${ID_LISTA_ESTADO_ENTREGABLE}). Por defecto ${ID_ESTADO_ENTREGABLE_PROCESO} = PROCESO`,
  })
  idEstado?: number;

  @ApiPropertyOptional({
    example: '2026-06-15T00:00:00.000Z',
    description: 'Fecha estimada de entrega (ISO 8601)',
  })
  fechaEstimada?: string;

  @ApiPropertyOptional({
    example: '2026-06-20T00:00:00.000Z',
    description: 'Fecha real de entrega (ISO 8601)',
  })
  fechaEntrega?: string;

  @ApiPropertyOptional({
    example: [42],
    description:
      'IDs de trabajadores responsables (traTrabajador). Contrato preferido Fase 4. El primero queda como principal en SQL.',
    type: [Number],
  })
  idTrabajadoresResponsables?: number[];

  @ApiPropertyOptional({
    example: 42,
    description:
      'Atajo v1 (un solo responsable). Si viene `idTrabajadoresResponsables`, este campo se ignora.',
    deprecated: true,
  })
  idTrabajadorResponsable?: number;

  revisionPlan?: number;

  motivo?: string;

  orden?: number;
}
