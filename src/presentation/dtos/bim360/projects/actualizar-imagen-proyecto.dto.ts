import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';

export class ActualizarImagenProyectoBim360Dto {
  static readonly schema: z.ZodType<ActualizarImagenProyectoBim360Dto> =
    defineZodDto<ActualizarImagenProyectoBim360Dto>(
      'ActualizarImagenProyectoBim360Dto',
      {
        image: { schema: z.string().min(1) },
        region: {
          schema: z
            .string()
            .refine(
              (value) => (['US', 'EMEA'] as readonly unknown[]).includes(value),
              { message: 'Seleccione una opción válida' },
            )
            .meta({ enum: ['US', 'EMEA'] }),
          optional: true,
        },
      },
    );

  image: string;

  region?: string;
}
