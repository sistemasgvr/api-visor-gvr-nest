import { IsArray, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ReenviarMailEnvioDto {
  @ApiProperty({ example: 'welcome' })
  @IsString()
  templateId!: string;

  @ApiProperty({ example: 42 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  idTrabajador!: number;
}

export class ReenviarPendientesMailEnvioDto {
  @ApiProperty({ example: 'welcome' })
  @IsString()
  templateId!: string;

  @ApiPropertyOptional({
    description: 'IDs específicos; si se omite, reenvía todos los pendientes/fallidos',
  })
  @IsOptional()
  @IsArray()
  @Type(() => Number)
  @IsInt({ each: true })
  idTrabajadores?: number[];
}
