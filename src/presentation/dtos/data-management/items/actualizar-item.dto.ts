import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';

export class ActualizarItemDto {
  static readonly schema: z.ZodType<ActualizarItemDto> =
    defineZodDto<ActualizarItemDto>('ActualizarItemDto', {
      data: {
        schema: z
          .record(z.string(), z.unknown())
          .refine(
            (value) =>
              value !== undefined &&
              value !== null &&
              (value as unknown) !== '',
            { message: 'El campo es obligatorio' },
          ),
      },
    });

  data: any;
}
