import { ApiProperty, OmitType } from '@nestjs/swagger';
import { ArrayUnique, IsArray, IsInt, Max, Min } from 'class-validator';
import { GuardarExcepcionCalendarioDto } from './guardar-excepcion-calendario.dto';
import type { GuardarFeriadoData } from '../../../../domain/repositories/calendarios.repository.interface';

export class CrearFeriadoDto
  extends OmitType(GuardarExcepcionCalendarioDto, ['revision'] as const)
  implements GuardarFeriadoData
{
  @ApiProperty({
    type: [Number],
    example: [1, 2],
    description:
      'Selección completa de calendarios, sin duplicados. [] permite guardar sin asignaciones.',
  })
  @IsArray()
  @ArrayUnique()
  @IsInt({ each: true })
  @Min(1, { each: true })
  @Max(2147483647, { each: true })
  idcalendarios: number[];
}
