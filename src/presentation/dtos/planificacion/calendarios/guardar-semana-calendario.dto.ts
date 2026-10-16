import { Type } from 'class-transformer';
import {
  IsArray,
  ArrayMinSize,
  ArrayMaxSize,
  ArrayUnique,
  IsBoolean,
  IsInt,
  IsString,
  Min,
  Max,
  MaxLength,
  Matches,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import type { ConfiguracionDiaCalendario } from '../../../../domain/entities/calendario.entity';
import type { GuardarSemanaCalendarioData } from '../../../../domain/repositories/calendarios.repository.interface';
import { RevisionCalendarioDto } from './revision-calendario.dto';

export class DiaSemanaCalendarioDto implements ConfiguracionDiaCalendario {
  @ApiProperty({ minimum: 1, maximum: 7, description: 'Lunes=1, domingo=7.' })
  @IsInt()
  @Min(1)
  @Max(7)
  diasemana: number;

  @ApiProperty()
  @IsBoolean()
  laborable: boolean;

  @ApiProperty({ nullable: true, example: '08:00' })
  @ValidateIf(
    (dia: DiaSemanaCalendarioDto) => dia.laborable || dia.horaentrada != null,
  )
  @IsString()
  @Matches(/^([01][0-9]|2[0-3]):[0-5][0-9]$/)
  horaentrada: string | null;

  @ApiProperty({ nullable: true, example: '17:00' })
  @ValidateIf(
    (dia: DiaSemanaCalendarioDto) => dia.laborable || dia.horasalida != null,
  )
  @IsString()
  @Matches(/^([01][0-9]|2[0-3]):[0-5][0-9]$/)
  horasalida: string | null;

  @ApiProperty({ minimum: 0, maximum: 1439, example: 60 })
  @IsInt()
  @Min(0)
  @Max(1439)
  minutosrefrigerio: number;
}

export class GuardarSemanaCalendarioDto
  extends RevisionCalendarioDto
  implements GuardarSemanaCalendarioData
{
  @ApiProperty({ example: 'America/Lima', maxLength: 100 })
  @IsString()
  @Matches(/^\S+$/u)
  @MaxLength(100)
  zonahoraria: string;

  @ApiProperty({ type: [DiaSemanaCalendarioDto], minItems: 7, maxItems: 7 })
  @IsArray()
  @ArrayMinSize(7)
  @ArrayMaxSize(7)
  @ArrayUnique((dia: DiaSemanaCalendarioDto | null) => dia?.diasemana)
  @ValidateNested({ each: true })
  @Type(() => DiaSemanaCalendarioDto)
  semana: DiaSemanaCalendarioDto[];
}
