import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';

export class ExportarRegistroArchivosPdfDto {
  static readonly schema: z.ZodType<ExportarRegistroArchivosPdfDto> =
    defineZodDto<ExportarRegistroArchivosPdfDto>(
      'ExportarRegistroArchivosPdfDto',
      {
        titulo: { schema: z.string().min(1).max(500) },
        incluirSubcarpetas: {
          schema: z.boolean(),
          transforms: [({ value }) => value === 'true' || value === true],
        },
        incluirAtributosPersonalizados: {
          schema: z.boolean(),
          transforms: [({ value }) => value === 'true' || value === true],
        },
        hubId: { schema: z.string().max(200), optional: true },
      },
    );

  titulo: string;

  /** true = carpeta actual y subcarpetas; false = solo carpeta actual */

  incluirSubcarpetas: boolean;

  /** Incluir columna de atributos personalizados (extension.data) */

  incluirAtributosPersonalizados: boolean;

  /** Hub ACC (mismo id de ruta) para resolver el nombre del proyecto al exportar */

  hubId?: string;
}
