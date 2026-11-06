import { z } from 'zod';
import { defineZodDto } from '../../validation/zod-dto';

export class AsignarRolMenuDto {
  static readonly schema: z.ZodType<AsignarRolMenuDto> =
    defineZodDto<AsignarRolMenuDto>('AsignarRolMenuDto', {
      id_rol: {
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

  id_rol: number;
}
