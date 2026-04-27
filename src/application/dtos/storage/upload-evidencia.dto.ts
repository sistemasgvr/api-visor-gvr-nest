import { Transform } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Min,
} from 'class-validator';

export class UploadEvidenciaDto {
  @Transform(({ value }) => parseInt(String(value), 10))
  @IsInt()
  actividadId: number;

  /** Fecha del día (jornada) YYYY-MM-DD → un solo segmento de carpeta en MinIO (ej. `2026-04-27`). */
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  diaActividad: string;

  /** 1 = primera evidencia del lote, etc. Si se envía, la clave en MinIO es `{id}-Modulo Actividades (n).{ext}`. */
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    const n = parseInt(String(value), 10);
    return Number.isNaN(n) ? undefined : n;
  })
  @IsInt()
  @Min(1)
  indiceEvidencia?: number;

  @IsOptional()
  @IsString()
  actividadSlug?: string;
}
