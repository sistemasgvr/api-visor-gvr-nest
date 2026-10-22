import { z } from 'zod';
import { defineZodDto } from '../../../validation/zod-dto';

export class CambiarEstadoWorkflowDto {
  static readonly schema: z.ZodType<CambiarEstadoWorkflowDto> =
    defineZodDto<CambiarEstadoWorkflowDto>('CambiarEstadoWorkflowDto', {
      status: {
        schema: z
          .union([z.literal('ACTIVE'), z.literal('INACTIVE')])
          .refine(
            (value) =>
              (['ACTIVE', 'INACTIVE'] as readonly unknown[]).includes(value),
            { message: 'Seleccione una opción válida' },
          )
          .meta({ enum: ['ACTIVE', 'INACTIVE'] }),
      },
    });

  status: 'ACTIVE' | 'INACTIVE';
}
