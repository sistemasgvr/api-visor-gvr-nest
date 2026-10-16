import { IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CrearVersionCalendarioDto {
  @ApiProperty({ minimum: 1, description: 'Versión publicada de origen.' })
  @IsInt()
  @Min(1)
  @Max(2147483647)
  idversionorigen: number;
}
