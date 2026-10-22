import { z } from 'zod';
import { defineZodDto } from '../../validation/zod-dto';

export class UploadEvidenciaDto {
  static readonly schema: z.ZodType<UploadEvidenciaDto> =
    defineZodDto<UploadEvidenciaDto>('UploadEvidenciaDto', {
      actividadId: {
        schema: z.number().int(),
        transforms: [({ value }) => parseInt(String(value), 10)],
      },
      diaActividad: { schema: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) },
      indiceEvidencia: {
        schema: z.number().int().min(1),
        optional: true,
        transforms: [
          ({ value }) => {
            if (value === undefined || value === null || value === '')
              return undefined;
            const n = parseInt(String(value), 10);
            return Number.isNaN(n) ? undefined : n;
          },
        ],
      },
      actividadSlug: { schema: z.string(), optional: true },
    });

  actividadId: number;

  /** Fecha del día (jornada) YYYY-MM-DD → un solo segmento de carpeta en MinIO (ej. `2026-04-27`). */

  diaActividad: string;

  /** 1 = primera evidencia del lote, etc. Si se envía, la clave en MinIO es `{id}-Modulo Actividades (n).{ext}`. */

  indiceEvidencia?: number;

  actividadSlug?: string;
}
