import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';

export class CrearReferenciaItemDto {
  static readonly schema: z.ZodType<CrearReferenciaItemDto> =
    defineZodDto<CrearReferenciaItemDto>('CrearReferenciaItemDto', {
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
