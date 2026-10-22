import { z } from 'zod';
import { defineZodDto } from '../../validation/zod-dto';

export class MoverMenuDto {
  static readonly schema: z.ZodType<MoverMenuDto> = defineZodDto<MoverMenuDto>(
    'MoverMenuDto',
    {
      id_padre_nuevo: {
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
        optional: true,
      },
    },
  );

  id_padre_nuevo?: number;
}
