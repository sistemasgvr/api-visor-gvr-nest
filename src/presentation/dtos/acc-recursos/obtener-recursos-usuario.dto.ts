import { z } from 'zod';
import { defineZodDto } from '../../validation/zod-dto';

export class ObtenerRecursosUsuarioDto {
  static readonly schema: z.ZodType<ObtenerRecursosUsuarioDto> =
    defineZodDto<ObtenerRecursosUsuarioDto>('ObtenerRecursosUsuarioDto', {
      tipo: { schema: z.string(), optional: true },
      rol: {
        schema: z
          .string()
          .refine(
            (value) =>
              (
                ['creador', 'asignado', 'modifico'] as readonly unknown[]
              ).includes(value),
            { message: 'Seleccione una opción válida' },
          )
          .meta({ enum: ['creador', 'asignado', 'modifico'] }),
        optional: true,
      },
      limit: {
        schema: z.number().int().min(1).max(100),
        optional: true,
        coerce: 'number',
      },
      offset: {
        schema: z.number().int().min(0),
        optional: true,
        coerce: 'number',
      },
    });

  tipo?: string;

  rol?: string;

  limit?: number;

  offset?: number;
}
