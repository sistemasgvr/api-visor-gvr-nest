import { IsIn, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import type { EstadoCalendario } from '../../../../domain/entities/calendario.entity';
import { RevisionCalendarioDto } from './revision-calendario.dto';

export class CambiarEstadoCalendarioDto extends RevisionCalendarioDto {
  @ApiProperty({ enum: [0, 1], description: '0 inactivo, 1 activo.' })
  @IsInt()
  @IsIn([0, 1])
  estado: EstadoCalendario;
}
