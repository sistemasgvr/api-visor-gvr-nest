import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsString, Matches } from 'class-validator';

export class UploadEvidenciaDto {
  @Transform(({ value }) => parseInt(String(value), 10))
  @IsInt()
  actividadId: number;

  /** Fecha del día (jornada) YYYY-MM-DD → un solo segmento de carpeta en MinIO (ej. `2026-04-27`). */
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  diaActividad: string;

  @IsOptional()
  @IsString()
  actividadSlug?: string;
}
