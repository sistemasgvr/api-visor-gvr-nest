import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';

export class CrearDescargaDto {
  static readonly schema: z.ZodType<CrearDescargaDto> =
    defineZodDto<CrearDescargaDto>('CrearDescargaDto', {
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
    formats: {
      fileType: string;
    };
  };
}
