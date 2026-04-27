import { Transform } from 'class-transformer';
import { IsInt, IsString, MinLength } from 'class-validator';

export class UploadEvidenciaDto {
  @Transform(({ value }) => parseInt(String(value), 10))
  @IsInt()
  actividadId: number;

  @IsString()
  @MinLength(1)
  actividadSlug: string;
}
