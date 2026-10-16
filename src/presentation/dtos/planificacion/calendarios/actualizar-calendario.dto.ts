import { IsString, IsOptional, Matches, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { ActualizarCalendarioData } from '../../../../domain/repositories/calendarios.repository.interface';
import { RevisionCalendarioDto } from './revision-calendario.dto';

export class ActualizarCalendarioDto
  extends RevisionCalendarioDto
  implements ActualizarCalendarioData
{
  @ApiProperty({ maxLength: 120 })
  @IsString()
  @Matches(/\S/u)
  @MaxLength(120)
  nombre: string;

  @ApiPropertyOptional({ maxLength: 2000, default: '' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  descripcion?: string;
}
