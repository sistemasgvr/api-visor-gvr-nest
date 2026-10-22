import { z } from 'zod';
import { defineZodDto } from '../../validation/zod-dto';

export class AsignarPermisoDto {
  static readonly schema: z.ZodType<AsignarPermisoDto> =
    defineZodDto<AsignarPermisoDto>('rol_AsignarPermisoDto', {
      id_permiso: {
        schema: z
          .number()
          .int()
          .refine(
            (value) =>
              value !== undefined &&
              value !== null &&
              (value as unknown) !== '',
            { message: 'El campo es obligatorio' },
          ),
      },
    });

  id_permiso: number;
}
