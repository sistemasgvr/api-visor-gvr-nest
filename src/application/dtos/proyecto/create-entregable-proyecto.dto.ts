import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  ID_ESTADO_ENTREGABLE_PROCESO,
  ID_LISTA_ESTADO_ENTREGABLE,
} from '../../../domain/constants/estado-entregable.constants';

export class CreateEntregableProyectoDto {
  @ApiProperty({ example: 1, description: 'ID del proyecto GVR (proProyecto)' })
  @IsInt()
  idProyecto: number;

  @ApiProperty({ example: 'Entrega fase 1', maxLength: 255 })
  @IsString()
  @MaxLength(255)
  nombre: string;

  @ApiPropertyOptional({ example: 'Planos y memorias', maxLength: 1000 })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  descripcion?: string;

  @ApiPropertyOptional({
    example: ID_ESTADO_ENTREGABLE_PROCESO,
    description: `Estado del entregable (genListado idLista ${ID_LISTA_ESTADO_ENTREGABLE}). Por defecto ${ID_ESTADO_ENTREGABLE_PROCESO} = PROCESO`,
  })
  @IsOptional()
  @IsInt()
  idEstado?: number;

  @ApiPropertyOptional({
    example: '2026-06-15T00:00:00.000Z',
    description: 'Fecha estimada de entrega (ISO 8601)',
  })
  @IsOptional()
  @IsDateString()
  fechaEstimada?: string;

  @ApiPropertyOptional({
    example: '2026-06-20T00:00:00.000Z',
    description: 'Fecha real de entrega (ISO 8601)',
  })
  @IsOptional()
  @IsDateString()
  fechaEntrega?: string;

  @ApiPropertyOptional({
    example: [42],
    description:
      'IDs de trabajadores responsables (traTrabajador). Contrato preferido Fase 4. El primero queda como principal en SQL.',
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  @Type(() => Number)
  @IsInt({ each: true })
  idTrabajadoresResponsables?: number[];

  @ApiPropertyOptional({
    example: 42,
    description:
      'Atajo v1 (un solo responsable). Si viene `idTrabajadoresResponsables`, este campo se ignora.',
    deprecated: true,
  })
  @IsOptional()
  @IsInt()
  idTrabajadorResponsable?: number;
}
