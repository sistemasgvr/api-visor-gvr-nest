import { IsDateString, IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateEntregableProyectoDto {
  @IsString()
  @MaxLength(255)
  nombre: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  descripcion?: string;

  @IsOptional()
  @IsInt()
  idEstado?: number;

  @IsOptional()
  @IsDateString()
  fechaEstimada?: string;

  @IsOptional()
  @IsDateString()
  fechaEntrega?: string;
}
