import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';

export class AsignarPermisoDto {
  static readonly schema: z.ZodType<AsignarPermisoDto> =
    defineZodDto<AsignarPermisoDto>('acc_resources_AsignarPermisoDto', {
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
      resource_id: {
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

  role_id: number;

  resource_id: number;
}
