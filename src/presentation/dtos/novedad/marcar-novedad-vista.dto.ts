import { z } from 'zod';
import { defineZodDto } from '../../validation/zod-dto';

export class MarcarNovedadVistaDto {
  static readonly schema: z.ZodType<MarcarNovedadVistaDto> =
    defineZodDto<MarcarNovedadVistaDto>('MarcarNovedadVistaDto', {
      idNovedadLanzamiento: {
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

  idNovedadLanzamiento: number;
}
