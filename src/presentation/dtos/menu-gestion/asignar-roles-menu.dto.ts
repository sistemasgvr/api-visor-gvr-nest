import { z } from 'zod';
import { defineZodDto } from '../../validation/zod-dto';

export class AsignarRolesMenuDto {
  static readonly schema: z.ZodType<AsignarRolesMenuDto> =
    defineZodDto<AsignarRolesMenuDto>('AsignarRolesMenuDto', {
      roles: {
        schema: z
          .array(z.number().int())
          .min(1)
          .refine(
            (value) =>
              value !== undefined &&
              value !== null &&
              (value as unknown) !== '',
            { message: 'El campo es obligatorio' },
          ),
      },
    });

  roles: number[];
}
