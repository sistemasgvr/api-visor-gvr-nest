import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';

export class ActualizarVersionDto {
  static readonly schema: z.ZodType<ActualizarVersionDto> =
    defineZodDto<ActualizarVersionDto>('ActualizarVersionDto', {
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

  data: Record<string, any>;
}
