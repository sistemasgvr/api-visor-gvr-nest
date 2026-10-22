import { z } from 'zod';
import { defineZodDto } from '../../validation/zod-dto';

export class GestionarRolesUsuarioDto {
  static readonly schema: z.ZodType<GestionarRolesUsuarioDto> =
    defineZodDto<GestionarRolesUsuarioDto>('GestionarRolesUsuarioDto', {
      rolesIds: {
        schema: z
          .array(z.number().int())
          .refine(
            (value) =>
              value !== undefined &&
              value !== null &&
              (value as unknown) !== '',
            { message: 'El campo es obligatorio' },
          ),
      },
    });

  rolesIds: number[];
}
