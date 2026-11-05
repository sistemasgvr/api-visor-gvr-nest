import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';

export class CrearReferenciaDto {
  static readonly schema: z.ZodType<CrearReferenciaDto> =
    defineZodDto<CrearReferenciaDto>(
      'data-management_folders_CrearReferenciaDto',
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
      },
    );

  data: {
    type: string;
    id?: string;
    meta: {
      extension?: {
        type: string;
        version: string;
      };
    };
  };
}
