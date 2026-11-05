import { z } from 'zod';
import { defineZodDto } from '../../validation/zod-dto';

export class ReordenarMenuDto {
  static readonly schema: z.ZodType<ReordenarMenuDto> =
    defineZodDto<ReordenarMenuDto>('ReordenarMenuDto', {
      orden_nuevo: {
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

  orden_nuevo: number;
}
