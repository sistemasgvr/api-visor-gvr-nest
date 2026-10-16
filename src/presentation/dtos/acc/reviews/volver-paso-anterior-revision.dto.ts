import { IsOptional, IsString } from 'class-validator';

export class VolverPasoAnteriorRevisionDto {
  @IsOptional()
  @IsString()
  notas?: string;
}
