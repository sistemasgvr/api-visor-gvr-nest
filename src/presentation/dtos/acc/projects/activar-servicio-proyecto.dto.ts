import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';

export class ActivarServicioProyectoDto {
  static readonly schema: z.ZodType<ActivarServicioProyectoDto> =
    defineZodDto<ActivarServicioProyectoDto>('ActivarServicioProyectoDto', {
      email: { schema: z.string().min(1).email() },
      service: {
        schema: z
          .string()
          .min(1)
          .refine(
            (value) =>
              (
                [
                  'docs',
                  'projectAdministration',
                  'cost',
                  'buildingConnected',
                  'assets',
                  'insight',
                  'modelCoordination',
                  'schedule',
                  'quantification',
                  'designCollaboration',
                ] as readonly unknown[]
              ).includes(value),
            { message: 'Seleccione una opción válida' },
          )
          .meta({
            enum: [
              'docs',
              'projectAdministration',
              'cost',
              'buildingConnected',
              'assets',
              'insight',
              'modelCoordination',
              'schedule',
              'quantification',
              'designCollaboration',
            ],
          }),
      },
      accessLevel: {
        schema: z
          .string()
          .refine(
            (value) =>
              (['administrator', 'user'] as readonly unknown[]).includes(value),
            { message: 'Seleccione una opción válida' },
          )
          .meta({ enum: ['administrator', 'user'] }),
        optional: true,
        defaultValue: 'administrator',
      },
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
    });

  email: string;

  service: string;

  accessLevel?: string = 'administrator';

  region?: string;
}
