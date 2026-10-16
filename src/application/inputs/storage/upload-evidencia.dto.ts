export class UploadEvidenciaDto {
  actividadId: number;

  /** Fecha del día (jornada) YYYY-MM-DD → un solo segmento de carpeta en MinIO (ej. `2026-04-27`). */

  diaActividad: string;

  /** 1 = primera evidencia del lote, etc. Si se envía, la clave en MinIO es `{id}-Modulo Actividades (n).{ext}`. */

  indiceEvidencia?: number;

  actividadSlug?: string;
}
