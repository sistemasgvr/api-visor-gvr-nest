import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';

export class CrearItemDto {
  static readonly schema: z.ZodType<CrearItemDto> = defineZodDto<CrearItemDto>(
    'CrearItemDto',
    {
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
      included: { schema: z.array(z.unknown()).optional() },
    },
  );

  data: any;

  included?: any[];
}
