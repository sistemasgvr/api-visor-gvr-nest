import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, Max, Min, ValidateIf } from 'class-validator';

export class ActualizarEstadoJornadaDto {
  @ApiProperty({ enum: [372, 373, 398, 399, 400, 401] })
  @IsInt()
  @IsIn([372, 373, 398, 399, 400, 401])
  idEstadoJornada: number;

  @ApiPropertyOptional({
    example: 120,
    description: 'Obligatorio para abrir una jornada (estado 372)',
    minimum: 1,
  })
  @ValidateIf(
    (dto: ActualizarEstadoJornadaDto) =>
      dto.idEstadoJornada === 372 || dto.duracionMinutos !== undefined,
  )
  @IsInt()
  @Min(1)
  @Max(2147483647)
  duracionMinutos?: number;
}
