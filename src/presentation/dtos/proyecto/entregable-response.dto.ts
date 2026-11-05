import { z } from 'zod';
import { defineZodDto } from '../../validation/zod-dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ID_ESTADO_ENTREGABLE_PROCESO } from '../../../domain/constants/estado-entregable.constants';

/** Item devuelto en listado y detalle de entregables */
export class EntregableItemDto {
  static readonly schema: z.ZodType<EntregableItemDto> =
    defineZodDto<EntregableItemDto>('EntregableItemDto', {
      id: { schema: z.number(), example: 1 },
      idproyecto: { schema: z.number(), example: 10 },
      nombreproyecto: {
        schema: z.string().optional(),
        example: 'Proyecto Torre Norte',
      },
      nombre: { schema: z.string(), example: 'Entrega fase 1' },
      descripcion: {
        schema: z.string().optional(),
        example: 'Descripción del entregable',
      },
      idestado: { schema: z.number(), example: ID_ESTADO_ENTREGABLE_PROCESO },
      estadonombre: { schema: z.string().optional(), example: 'PROCESO' },
      fechaestimada: {
        schema: z.string().optional(),
        example: '2026-06-15T00:00:00.000Z',
      },
      fechaentrega: { schema: z.string().optional(), example: null },
      estado: { schema: z.number(), example: 1 },
      fechacreacion: { schema: z.string().optional() },
      fechamodificacion: { schema: z.string().optional() },
      idusuariocreacion: { schema: z.number().optional(), example: 1 },
      nombreusuariocreacion: {
        schema: z.string().optional(),
        example: 'Juan Pérez',
      },
      fotoperfilusuariocreacion: {
        schema: z.union([z.null(), z.string()]).optional(),
        example: 'https://storage.example.com/profiles/usuario.jpg',
        description: 'URL resuelta de la foto de perfil del usuario creador',
      },
      idusuariomodificacion: { schema: z.number().optional(), example: 1 },
      nombreusuariomodificacion: {
        schema: z.string().optional(),
        example: 'Juan Pérez',
      },
      idtrabajadorresponsable: {
        schema: z.union([z.null(), z.number()]).optional(),
        example: 42,
        description: 'ID del responsable principal (atajo v1)',
      },
      nombretrabajadorresponsable: {
        schema: z.union([z.null(), z.string()]).optional(),
        example: 'Carlos Frontado',
        description: 'Nombre del responsable principal',
      },
      responsables: {
        schema: z
          .array(
            z.object({
              idtrabajador: z.number(),
              nombretrabajador: z.string(),
              esprincipal: z.union([z.literal(false), z.literal(true)]),
            }),
          )
          .optional(),
        description:
          'Lista de responsables activos (preparado para multi-asignación)',
        example: [
          {
            idtrabajador: 42,
            nombretrabajador: 'Carlos Frontado',
            esprincipal: true,
          },
        ],
      },
    });

  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 10 })
  idproyecto: number;

  @ApiPropertyOptional({ example: 'Proyecto Torre Norte' })
  nombreproyecto?: string;

  @ApiProperty({ example: 'Entrega fase 1' })
  nombre: string;

  @ApiPropertyOptional({ example: 'Descripción del entregable' })
  descripcion?: string;

  @ApiProperty({ example: ID_ESTADO_ENTREGABLE_PROCESO })
  idestado: number;

  @ApiPropertyOptional({ example: 'PROCESO' })
  estadonombre?: string;

  @ApiPropertyOptional({ example: '2026-06-15T00:00:00.000Z' })
  fechaestimada?: string;

  @ApiPropertyOptional({ example: null })
  fechaentrega?: string;

  @ApiProperty({ example: 1 })
  estado: number;

  @ApiPropertyOptional()
  fechacreacion?: string;

  @ApiPropertyOptional()
  fechamodificacion?: string;

  @ApiPropertyOptional({ example: 1 })
  idusuariocreacion?: number;

  @ApiPropertyOptional({ example: 'Juan Pérez' })
  nombreusuariocreacion?: string;

  @ApiPropertyOptional({
    example: 'https://storage.example.com/profiles/usuario.jpg',
    description: 'URL resuelta de la foto de perfil del usuario creador',
  })
  fotoperfilusuariocreacion?: string | null;

  @ApiPropertyOptional({ example: 1 })
  idusuariomodificacion?: number;

  @ApiPropertyOptional({ example: 'Juan Pérez' })
  nombreusuariomodificacion?: string;

  @ApiPropertyOptional({
    example: 42,
    description: 'ID del responsable principal (atajo v1)',
  })
  idtrabajadorresponsable?: number | null;

  @ApiPropertyOptional({
    example: 'Carlos Frontado',
    description: 'Nombre del responsable principal',
  })
  nombretrabajadorresponsable?: string | null;

  @ApiPropertyOptional({
    description:
      'Lista de responsables activos (preparado para multi-asignación)',
    type: 'array',
    example: [
      {
        idtrabajador: 42,
        nombretrabajador: 'Carlos Frontado',
        esprincipal: true,
      },
    ],
  })
  responsables?: Array<{
    idtrabajador: number;
    nombretrabajador: string;
    esprincipal: boolean;
  }>;
}

export class EntregableMutationResultDto {
  static readonly schema: z.ZodType<EntregableMutationResultDto> =
    defineZodDto<EntregableMutationResultDto>('EntregableMutationResultDto', {
      success: {
        schema: z.union([z.literal(false), z.literal(true)]),
        example: true,
      },
      message: {
        schema: z.string(),
        example: 'Entregable creado exitosamente',
      },
      id: {
        schema: z.number().optional(),
        example: 12,
        description: 'Solo en crear',
      },
    });

  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Entregable creado exitosamente' })
  message: string;

  @ApiPropertyOptional({ example: 12, description: 'Solo en crear' })
  id?: number;
}

export class EntregablesPaginationDto {
  static readonly schema: z.ZodType<EntregablesPaginationDto> =
    defineZodDto<EntregablesPaginationDto>('EntregablesPaginationDto', {
      total: { schema: z.number(), example: 25 },
      limit: { schema: z.number(), example: 10 },
      offset: { schema: z.number(), example: 0 },
      total_pages: { schema: z.number(), example: 3 },
      current_page: { schema: z.number(), example: 1 },
    });

  @ApiProperty({ example: 25 })
  total: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 0 })
  offset: number;

  @ApiProperty({ example: 3 })
  total_pages: number;

  @ApiProperty({ example: 1 })
  current_page: number;
}

export class EntregableConteoEstadoDto {
  static readonly schema: z.ZodType<EntregableConteoEstadoDto> =
    defineZodDto<EntregableConteoEstadoDto>('EntregableConteoEstadoDto', {
      idestado: { schema: z.number(), example: 563 },
      estadonombre: { schema: z.string(), example: 'EN RETRASO' },
      cantidad: { schema: z.number(), example: 4 },
    });

  @ApiProperty({ example: 563 })
  idestado: number;

  @ApiProperty({ example: 'EN RETRASO' })
  estadonombre: string;

  @ApiProperty({ example: 4 })
  cantidad: number;
}

export class ListarEntregablesDataDto {
  static readonly schema: z.ZodType<ListarEntregablesDataDto> =
    defineZodDto<ListarEntregablesDataDto>('ListarEntregablesDataDto', {
      data: {
        schema: z.array(
          z.object({
            id: z.number(),
            idproyecto: z.number(),
            nombreproyecto: z.string().optional(),
            nombre: z.string(),
            descripcion: z.string().optional(),
            idestado: z.number(),
            estadonombre: z.string().optional(),
            fechaestimada: z.string().optional(),
            fechaentrega: z.string().optional(),
            estado: z.number(),
            fechacreacion: z.string().optional(),
            fechamodificacion: z.string().optional(),
            idusuariocreacion: z.number().optional(),
            nombreusuariocreacion: z.string().optional(),
            fotoperfilusuariocreacion: z
              .union([z.null(), z.string()])
              .optional(),
            idusuariomodificacion: z.number().optional(),
            nombreusuariomodificacion: z.string().optional(),
            idtrabajadorresponsable: z.union([z.null(), z.number()]).optional(),
            nombretrabajadorresponsable: z
              .union([z.null(), z.string()])
              .optional(),
            responsables: z
              .array(
                z.object({
                  idtrabajador: z.number(),
                  nombretrabajador: z.string(),
                  esprincipal: z.unknown(),
                }),
              )
              .optional(),
          }),
        ),
      },
      pagination: {
        schema: z.object({
          total: z.number(),
          limit: z.number(),
          offset: z.number(),
          total_pages: z.number(),
          current_page: z.number(),
        }),
      },
      conteosPorEstado: {
        schema: z.array(
          z.object({
            idestado: z.number(),
            estadonombre: z.string(),
            cantidad: z.number(),
          }),
        ),
        description:
          'Conteos por estado (misma visibilidad; no filtra por idEstado activo)',
      },
    });

  @ApiProperty({ type: [EntregableItemDto] })
  data: EntregableItemDto[];

  @ApiProperty({ type: EntregablesPaginationDto })
  pagination: EntregablesPaginationDto;

  @ApiProperty({
    type: [EntregableConteoEstadoDto],
    description:
      'Conteos por estado (misma visibilidad; no filtra por idEstado activo)',
  })
  conteosPorEstado: EntregableConteoEstadoDto[];
}

/** Opción { value, label } para CustomSelectSearch */
export class EntregableSelectOptionDto {
  static readonly schema: z.ZodType<EntregableSelectOptionDto> =
    defineZodDto<EntregableSelectOptionDto>('EntregableSelectOptionDto', {
      value: {
        schema: z.number(),
        example: 12,
        description: 'ID del entregable',
      },
      label: { schema: z.string(), example: 'Entrega fase 1 (PROCESO)' },
    });

  @ApiProperty({ example: 12, description: 'ID del entregable' })
  value: number;

  @ApiProperty({ example: 'Entrega fase 1 (PROCESO)' })
  label: string;
}
