import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';

export class ActualizarNivelPermisoUsuarioDto {
  static readonly schema: z.ZodType<ActualizarNivelPermisoUsuarioDto> =
    defineZodDto<ActualizarNivelPermisoUsuarioDto>(
      'ActualizarNivelPermisoUsuarioDto',
      {
        permission_level_id: {
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
      },
    );

  permission_level_id: number; // ID del nuevo nivel de permiso
}
