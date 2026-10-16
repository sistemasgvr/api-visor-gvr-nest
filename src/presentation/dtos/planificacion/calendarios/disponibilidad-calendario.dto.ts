import { IsDateString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DisponibilidadCalendarioDto {
  @ApiProperty({ example: '2026-10-01' })
  @IsDateString({ strict: true })
  @Matches(/^(?!0000)[0-9]{4}-[0-9]{2}-[0-9]{2}$/)
  desde: string;

  @ApiProperty({
    example: '2026-10-31',
    description: 'Fin inclusivo; máximo 366 días.',
  })
  @IsDateString({ strict: true })
  @Matches(/^(?!0000)[0-9]{4}-[0-9]{2}-[0-9]{2}$/)
  hasta: string;
}
