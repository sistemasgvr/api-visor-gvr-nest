import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

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
    example: 561,
    description: 'Estado del entregable (genListado idLista 46). Por defecto 561 = PROCESO',
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
}
