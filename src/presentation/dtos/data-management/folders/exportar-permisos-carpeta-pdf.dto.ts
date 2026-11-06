import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';

export class ExportarPermisosCarpetaPdfDto {
  static readonly schema: z.ZodType<ExportarPermisosCarpetaPdfDto> =
    defineZodDto<ExportarPermisosCarpetaPdfDto>(
      'ExportarPermisosCarpetaPdfDto',
      {
        titulo: { schema: z.string().min(1).max(500) },
        alcance: {
          schema: z
            .union([
              z.literal('current_tree'),
              z.literal('all_project_folders'),
            ])
            .refine(
              (value) =>
                (
                  ['current_tree', 'all_project_folders'] as readonly unknown[]
                ).includes(value),
              { message: 'Seleccione una opción válida' },
            )
            .meta({ enum: ['current_tree', 'all_project_folders'] }),
        },
        hubId: { schema: z.string(), optional: true },
      },
    );

  titulo: string;

  /** current_tree = desde carpeta actual; all_project_folders = todo el árbol de archivos del proyecto */

  alcance: 'current_tree' | 'all_project_folders';

  /** Obligatorio si alcance = all_project_folders (mismo id de hub que en el front) */

  hubId?: string;
}
