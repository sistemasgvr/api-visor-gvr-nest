import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

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
    example: 562,
    description: 'Estado del entregable (genListado idLista 46: 561 PROCESO, 562 CULMINADO, 563 RETRASO)',
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
}
