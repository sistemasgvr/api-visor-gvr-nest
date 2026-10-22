import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';

export class CrearBucketDto {
  static readonly schema: z.ZodType<CrearBucketDto> =
    defineZodDto<CrearBucketDto>('CrearBucketDto', {
      bucketKey: {
        schema: z
          .string()
          .min(1)
          .min(3)
          .max(128)
          .regex(/^[-_.a-z0-9]+$/),
      },
      policyKey: {
        schema: z
          .string()
          .refine(
            (value) =>
              (
                ['transient', 'temporary', 'persistent'] as readonly unknown[]
              ).includes(value),
            { message: 'Seleccione una opción válida' },
          )
          .meta({ enum: ['transient', 'temporary', 'persistent'] }),
        optional: true,
      },
      region: {
        schema: z
          .string()
          .refine(
            (value) =>
              (['US', 'EMEA', 'AP'] as readonly unknown[]).includes(value),
            { message: 'Seleccione una opción válida' },
          )
          .meta({ enum: ['US', 'EMEA', 'AP'] }),
        optional: true,
      },
    });

  bucketKey: string;

  policyKey?: string;

  region?: string;
}
