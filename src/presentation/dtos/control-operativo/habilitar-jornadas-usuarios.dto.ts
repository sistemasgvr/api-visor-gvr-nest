import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsInt,
  Matches,
  Max,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class HabilitarJornadasUsuariosDto {
  @ApiProperty({
    type: [Number],
    description: 'IDs de tratrabajador de la pantalla Usuarios',
    example: [101, 102],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  @Min(1, { each: true })
  @Max(2147483647, { each: true })
  idTrabajadores: number[];

  @ApiProperty({ example: '2026-10-12' })
  @IsDateString({ strict: true })
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  fechaInicio: string;

  @ApiProperty({ example: '2026-10-16' })
  @IsDateString({ strict: true })
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  fechaFin: string;

  @ApiProperty({
    example: 120,
    description: 'Minutos desde la confirmación de la habilitación',
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  @Max(2147483647)
  duracionMinutos: number;
}
