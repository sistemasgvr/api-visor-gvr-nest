import { z } from 'zod';
import { defineZodDto } from '../../validation/zod-dto';

export class ActividadEvidenciaInDto {
  static readonly schema: z.ZodType<ActividadEvidenciaInDto> =
    defineZodDto<ActividadEvidenciaInDto>('ActividadEvidenciaInDto', {
      url: { schema: z.string().max(2000), defaultValue: '' },
      nombreOriginal: { schema: z.string().max(500), optional: true },
      tipoMime: { schema: z.string().max(255), optional: true },
      tamanoBytes: {
        schema: z
          .number()
          .min(0)
          .max(56 * 1024 * 1024 * 1024),
        optional: true,
        when: (o) => o.tamanoBytes != null,
        coerce: 'number',
      },
    });

  url: string = '';

  nombreOriginal?: string;

  tipoMime?: string;

  tamanoBytes?: number;
}

export class AgregarEvidenciasActividadDto {
  static readonly schema: z.ZodType<AgregarEvidenciasActividadDto> =
    defineZodDto<AgregarEvidenciasActividadDto>(
      'AgregarEvidenciasActividadDto',
      {
        evidencias: {
          schema: z.array(z.lazy(() => ActividadEvidenciaInDto.schema)).max(50),
          optional: true,
        },
        urls: { schema: z.array(z.string()).max(50), optional: true },
      },
    );

  /** Nuevo: metadatos por URL (nombre, mime, tamaño en genArchivo). */

  evidencias?: ActividadEvidenciaInDto[];

  /** Compat: solo URL (sin metadatos). */
  urls?: string[];
}
