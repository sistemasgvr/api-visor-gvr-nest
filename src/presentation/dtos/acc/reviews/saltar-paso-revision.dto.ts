import { IsOptional, IsString } from 'class-validator';

export class SaltarPasoRevisionDto {
  @IsOptional()
  @IsString()
  notas?: string;
}
