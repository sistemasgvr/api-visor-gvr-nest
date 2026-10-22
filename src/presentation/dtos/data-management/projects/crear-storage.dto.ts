import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';

export class CrearStorageDto {
  static readonly schema: z.ZodType<CrearStorageDto> =
    defineZodDto<CrearStorageDto>('CrearStorageDto', {
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
    attributes: {
      name: string;
    };
    relationships: {
      target: {
        data: {
          type: string;
          id: string;
        };
      };
    };
  };
}
