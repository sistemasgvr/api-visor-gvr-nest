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
  ID_ESTADO_ENTREGABLE_CULMINADO,
  ID_ESTADO_ENTREGABLE_PROCESO,
  ID_ESTADO_ENTREGABLE_RETRASO,
  ID_LISTA_ESTADO_ENTREGABLE,
} from '../../../domain/constants/estado-entregable.constants';

export class UpdateEntregableProyectoDto {
  @ApiProperty({ example: 'Entrega fase 1 (rev.)', maxLength: 255 })
  @IsString()
  @MaxLength(255)
  nombre: string;

  @ApiPropertyOptional({ example: 'Descripción actualizada', maxLength: 1000 })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  descripcion?: string;

  @ApiPropertyOptional({
    example: ID_ESTADO_ENTREGABLE_CULMINADO,
    description: `Estado del entregable (genListado idLista ${ID_LISTA_ESTADO_ENTREGABLE}: ${ID_ESTADO_ENTREGABLE_PROCESO} PROCESO, ${ID_ESTADO_ENTREGABLE_CULMINADO} CULMINADO, ${ID_ESTADO_ENTREGABLE_RETRASO} RETRASO)`,
  })
  @IsOptional()
  @IsInt()
  idEstado?: number;

  @ApiPropertyOptional({
    example: '2026-06-15T00:00:00.000Z',
    description: 'null para limpiar la fecha estimada',
  })
  @IsOptional()
  @IsDateString()
  fechaEstimada?: string;

  @ApiPropertyOptional({
    example: '2026-06-20T00:00:00.000Z',
    description: 'null para limpiar la fecha de entrega',
  })
  @IsOptional()
  @IsDateString()
  fechaEntrega?: string;

  @ApiPropertyOptional({
    example: [42],
    description:
      'Reemplaza el set de responsables. Omitir (junto con idTrabajadorResponsable) para no tocar responsables. [] quita todos.',
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
      'Atajo v1. Si se envía, reemplaza el set con un solo id. Ignorado si viene `idTrabajadoresResponsables`.',
    deprecated: true,
  })
  @IsOptional()
  @IsInt()
  idTrabajadorResponsable?: number;
}
