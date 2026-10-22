import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';

export class AsignarPermisoUsuarioDto {
  static readonly schema: z.ZodType<AsignarPermisoUsuarioDto> =
    defineZodDto<AsignarPermisoUsuarioDto>('AsignarPermisoUsuarioDto', {
      user_id: {
        schema: z
          .number()
          .int()
          .min(1)
          .refine(
            (value) =>
              value !== undefined &&
              value !== null &&
              (value as unknown) !== '',
            { message: 'El campo es obligatorio' },
          ),
        coerce: 'number',
      },
      resource_id: {
        schema: z
          .number()
          .int()
          .min(1)
          .refine(
            (value) =>
              value !== undefined &&
              value !== null &&
              (value as unknown) !== '',
            { message: 'El campo es obligatorio' },
          ),
        coerce: 'number',
      },
      permission_level_id: {
        schema: z.number().int().min(1),
        optional: true,
        coerce: 'number',
      },
    });

  user_id: number;

  resource_id: number;

  permission_level_id?: number; // ID del nivel de permiso (default: 2 = "view_download")
}
