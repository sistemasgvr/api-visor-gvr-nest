import { IsString, IsOptional, Matches, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { CrearCalendarioData } from '../../../../domain/repositories/calendarios.repository.interface';

export class CrearCalendarioDto implements CrearCalendarioData {
  @ApiProperty({ maxLength: 120, example: 'Consultoría remota' })
  @IsString()
  @Matches(/\S/u)
  @MaxLength(120)
  nombre: string;

  @ApiPropertyOptional({ maxLength: 2000 })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  descripcion?: string;

  @ApiPropertyOptional({ default: 'America/Lima', maxLength: 100 })
  @IsOptional()
  @IsString()
  @Matches(/^\S+$/u)
  @MaxLength(100)
  zonahoraria?: string;
}
