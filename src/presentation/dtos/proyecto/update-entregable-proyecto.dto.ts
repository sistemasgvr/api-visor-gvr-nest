import { z } from 'zod';
import { defineZodDto, isoDate } from '../../validation/zod-dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import {
  ID_ESTADO_ENTREGABLE_CULMINADO,
  ID_ESTADO_ENTREGABLE_PROCESO,
  ID_ESTADO_ENTREGABLE_RETRASO,
  ID_LISTA_ESTADO_ENTREGABLE,
} from '../../../domain/constants/estado-entregable.constants';

export class UpdateEntregableProyectoDto {
  static readonly schema: z.ZodType<UpdateEntregableProyectoDto> =
    defineZodDto<UpdateEntregableProyectoDto>('UpdateEntregableProyectoDto', {
      nombre: { schema: z.string().max(255), example: 'Entrega fase 1 (rev.)' },
      descripcion: {
        schema: z.string().max(1000),
        optional: true,
        example: 'Descripción actualizada',
      },
      idEstado: {
        schema: z.number().int(),
        optional: true,
        example: ID_ESTADO_ENTREGABLE_CULMINADO,
        description: `Estado del entregable (genListado idLista ${ID_LISTA_ESTADO_ENTREGABLE}: ${ID_ESTADO_ENTREGABLE_PROCESO} PROCESO, ${ID_ESTADO_ENTREGABLE_CULMINADO} CULMINADO, ${ID_ESTADO_ENTREGABLE_RETRASO} RETRASO)`,
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
        description: 'null para limpiar la fecha estimada',
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
        description: 'null para limpiar la fecha de entrega',
      },
      idTrabajadoresResponsables: {
        schema: z.array(z.number().int()),
        optional: true,
        coerce: 'number',
        example: [42],
        description:
          'Reemplaza el set de responsables. Omitir (junto con idTrabajadorResponsable) para no tocar responsables. [] quita todos.',
      },
      idTrabajadorResponsable: {
        schema: z.number().int(),
        optional: true,
        example: 42,
        description:
          'Atajo v1. Si se envía, reemplaza el set con un solo id. Ignorado si viene `idTrabajadoresResponsables`.',
      },
      revisionPlan: { schema: z.number().int().min(1), optional: true },
      motivo: { schema: z.string().max(1000), optional: true },
      orden: { schema: z.number().int().min(0), optional: true },
    });

  @ApiProperty({ example: 'Entrega fase 1 (rev.)', maxLength: 255 })
  nombre: string;

  @ApiPropertyOptional({ example: 'Descripción actualizada', maxLength: 1000 })
  descripcion?: string;

  @ApiPropertyOptional({
    example: ID_ESTADO_ENTREGABLE_CULMINADO,
    description: `Estado del entregable (genListado idLista ${ID_LISTA_ESTADO_ENTREGABLE}: ${ID_ESTADO_ENTREGABLE_PROCESO} PROCESO, ${ID_ESTADO_ENTREGABLE_CULMINADO} CULMINADO, ${ID_ESTADO_ENTREGABLE_RETRASO} RETRASO)`,
  })
  idEstado?: number;

  @ApiPropertyOptional({
    example: '2026-06-15T00:00:00.000Z',
    description: 'null para limpiar la fecha estimada',
  })
  fechaEstimada?: string;

  @ApiPropertyOptional({
    example: '2026-06-20T00:00:00.000Z',
    description: 'null para limpiar la fecha de entrega',
  })
  fechaEntrega?: string;

  @ApiPropertyOptional({
    example: [42],
    description:
      'Reemplaza el set de responsables. Omitir (junto con idTrabajadorResponsable) para no tocar responsables. [] quita todos.',
    type: [Number],
  })
  idTrabajadoresResponsables?: number[];

  @ApiPropertyOptional({
    example: 42,
    description:
      'Atajo v1. Si se envía, reemplaza el set con un solo id. Ignorado si viene `idTrabajadoresResponsables`.',
    deprecated: true,
  })
  idTrabajadorResponsable?: number;

  revisionPlan?: number;

  motivo?: string;

  orden?: number;
}
