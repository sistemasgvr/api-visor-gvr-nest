import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';

export class CrearVersionDto {
  static readonly schema: z.ZodType<CrearVersionDto> =
    defineZodDto<CrearVersionDto>('CrearVersionDto', {
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
