import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';

export class ActualizarCarpetaDto {
  static readonly schema: z.ZodType<ActualizarCarpetaDto> =
    defineZodDto<ActualizarCarpetaDto>('ActualizarCarpetaDto', {
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

  data: {
    type: string;
    id: string;
    attributes: {
      displayName?: string;
      name?: string;
      hidden?: boolean;
    };
  };
}
