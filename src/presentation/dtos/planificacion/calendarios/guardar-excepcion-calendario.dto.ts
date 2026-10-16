import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { GuardarExcepcionCalendarioData } from '../../../../domain/repositories/calendarios.repository.interface';
import { RevisionCalendarioDto } from './revision-calendario.dto';

export class GuardarExcepcionCalendarioDto
  extends RevisionCalendarioDto
  implements GuardarExcepcionCalendarioData
{
  @ApiProperty({
    example: '2026-12-24',
    description: 'Fecha local, sin componente horario.',
  })
  @IsDateString({ strict: true })
  @Matches(/^(?!0000)[0-9]{4}-[0-9]{2}-[0-9]{2}$/)
  fecha: string;

  @ApiProperty({ maxLength: 160 })
  @IsString()
  @Matches(/\S/u)
  @MaxLength(160)
  nombre: string;

  @ApiProperty({
    example: 617,
    minimum: 1,
    maximum: 2147483647,
    description:
      'ID de una opción activa de la lista 48 (tipo de excepción de calendario).',
  })
  @IsInt()
  @Min(1)
  @Max(2147483647)
  idtipo: number;

  @ApiProperty({
    minimum: 0,
    maximum: 1439,
    description: '0=feriado completo; >0=límite de minutos del día.',
  })
  @IsInt()
  @Min(0)
  @Max(1439)
  minutosefectivos: number;

  @ApiPropertyOptional({ default: true })
  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsBoolean()
  activo?: boolean;
}
