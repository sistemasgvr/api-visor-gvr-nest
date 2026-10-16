import { Type } from 'class-transformer';
import { IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RevisionCalendarioDto {
  @ApiProperty({
    minimum: 1,
    description:
      'Revisión recibida en el último detalle; no es el número de versión.',
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(2147483647)
  revision: number;
}
