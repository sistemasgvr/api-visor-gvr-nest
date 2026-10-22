import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';

export class SincronizarPermisosUsuarioDto {
  static readonly schema: z.ZodType<SincronizarPermisosUsuarioDto> =
    defineZodDto<SincronizarPermisosUsuarioDto>(
      'SincronizarPermisosUsuarioDto',
      {
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
        resource_ids: {
          schema: z
            .array(z.number().int().min(1))
            .min(0)
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

  user_id: number;

  resource_ids: number[];
}
