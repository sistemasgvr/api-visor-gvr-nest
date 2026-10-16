import { ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ListarCalendariosDto } from './listar-calendarios.dto';

export class ListarFeriadosDto extends OmitType(ListarCalendariosDto, [
  'busqueda',
] as const) {
  @ApiPropertyOptional({ maxLength: 160 })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  busqueda?: string;

  @ApiPropertyOptional({ default: 12, minimum: 1, maximum: 100 })
  limit?: number;
}
