import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';

export class SincronizarPermisosRolDto {
  static readonly schema: z.ZodType<SincronizarPermisosRolDto> =
    defineZodDto<SincronizarPermisosRolDto>('SincronizarPermisosRolDto', {
      role_id: {
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
      resource_ids: {
        schema: z
          .array(z.number().int())
          .refine(
            (value) =>
              value !== undefined &&
              value !== null &&
              (value as unknown) !== '',
            { message: 'El campo es obligatorio' },
          ),
      },
    });

  role_id: number;

  resource_ids: number[];
}
